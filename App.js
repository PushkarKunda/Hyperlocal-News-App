import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import NewsCard from './src/components/NewsCard';
import AppIcon from './src/components/common/AppIcon';
import * as Icons from './src/assets/icons';

export default function App() {
  const [containerHeight, setContainerHeight] = useState(0);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch('https://newsdata.io/api/1/latest?apikey=pub_46cfb5988d8a4d48833eaa132d54afa5&q=india');
      const data = await response.json();
      if (data.status === 'success') {
        setNewsData(data.results);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchNews(true);
  };

  const TabItem = ({ icon, label, active, onPress, color, style, size = 24 }) => (
    <TouchableOpacity
      style={[styles.tabItem, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <AppIcon
        icon={icon}
        size={size}
        color={color || (active ? '#5A5AF5' : '#8A92A6')}
      />
      {label ? (
        <Text style={[styles.tabLabel, active && { color: '#5A5AF5', fontWeight: 'bold' }]}>
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainWrapper}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <Ionicons name="menu-outline" size={32} color="#1a1a1a" />
        <Text style={styles.headerTitle}>News Detail App</Text>
        <View style={styles.headerRight}>
          <TabItem icon={Icons.Search} color="#1a1a1a" size={26} style={{ marginRight: 18 }} />
          <TabItem icon={Icons.Bell} color="#4A5568" size={24} />
        </View>
      </View>

      {/* Swipeable List Area */}
      <View
        style={styles.container}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        {containerHeight > 0 && loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#5A5AF5" />
            <Text style={styles.loadingText}>Fetching Latest ...</Text>
          </View>
        ) : containerHeight > 0 && (
          <FlatList
            data={newsData}
            keyExtractor={(item, index) => item.article_id || index.toString()}
            renderItem={({ item }) => <NewsCard item={item} containerHeight={containerHeight} />}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToAlignment="start"
            decelerationRate="fast"
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            getItemLayout={(data, index) => ({
              length: containerHeight,
              offset: containerHeight * index,
              index,
            })}
          />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TabItem icon={Icons.Home} label="Feed" active={true} onPress={handleRefresh} />
        <TabItem icon={Icons.Compass} label="Discover" />
        <TabItem icon={Icons.Bookmark} label="Saved" />
        <TabItem icon={Icons.Person} label="Profile" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40, // Add padding to dodge system status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginLeft: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#fff',
    paddingBottom: 10, // Bottom inset padding
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#8A92A6',
    fontWeight: '600'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#4a4a4a',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600'
  }
});
