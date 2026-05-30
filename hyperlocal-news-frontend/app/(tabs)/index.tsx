import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNewsFeed } from '@/hooks/useApi';
import { ImmersiveNewsCard } from '@/components/ImmersiveNewsCard';
import MenuOptions from '@/components/MenuOptions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const insets = useSafeAreaInsets();
  const { newsId } = useLocalSearchParams<{ newsId?: string }>();
  const flatListRef = useRef<FlatList>(null);
  const [scrollHeight, setScrollHeight] = useState(screenHeight);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Load news dynamically from our simulated backend using React Query
  const { data: news = [], isLoading } = useNewsFeed();

  useEffect(() => {
    if (newsId && news.length > 0) {
      const index = news.findIndex(item => item.id === newsId);
      if (index !== -1 && scrollHeight > 0) {
        const timer = setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: true });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [newsId, scrollHeight, news]);

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />
        <LoadingSpinner fullScreen text="Curating your local news..." color={colors.primary} colorScheme={colorScheme ?? 'light'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />

      {/* Symmetrical Theme-Aware Header Section */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.headerLeftButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(70, 72, 212, 0.05)' }]} 
          onPress={() => setIsMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>HyperLocal</Text>
      </View>

      {/* Main Snap Scrolling Feed Container */}
      <View 
        style={styles.feedWrapper}
        onLayout={(e) => setScrollHeight(e.nativeEvent.layout.height)}
      >
        <FlatList
          ref={flatListRef}
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ImmersiveNewsCard 
              item={item} 
              containerHeight={scrollHeight} 
            />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={scrollHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          bounces={false}
          getItemLayout={(data, index) => ({
            length: scrollHeight,
            offset: scrollHeight * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise(resolve => setTimeout(resolve, 50));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            });
          }}
        />
      </View>

      {/* Reusable Menu Drawer Overlay Component */}
      <MenuOptions 
        isVisible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 64,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerLeftButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },
});