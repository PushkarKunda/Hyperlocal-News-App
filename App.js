import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import NewsCard from './src/components/NewsCard';
import { Ionicons } from '@expo/vector-icons';

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

  const TabItem = ({ icon, label, active, onPress }) => (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? '#5A5AF5' : '#8A92A6'} />
      <Text style={[styles.tabLabel, active && { color: '#5A5AF5', fontWeight: 'bold' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainWrapper}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <Ionicons name="menu-outline" size={32} color="#1a1a1a" />
        <Text style={styles.headerTitle}>Whispry</Text>
        <View style={styles.headerRight}>
          <Ionicons name="search-outline" size={26} color="#1a1a1a" style={{ marginRight: 16 }} />
          <Ionicons name="notifications" size={24} color="#4A5568" />
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
        <TabItem icon="home" label="Feed" active={true} onPress={handleRefresh} />
        <TabItem icon="compass-outline" label="Discover" />
        <TabItem icon="bookmark-outline" label="Saved" />
        <TabItem icon="person-outline" label="Profile" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 45, // Add padding to dodge system status bar
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
    paddingBottom: 25, // Bottom inset padding
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
