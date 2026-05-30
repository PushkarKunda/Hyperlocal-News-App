import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNewsFeed } from '@/hooks/useApi';
import { ImmersiveNewsCard } from '@/components/ImmersiveNewsCard';
import MenuOptions from '@/components/MenuOptions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
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
      <View style={styles.darkLoaderContainer}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <LoadingSpinner fullScreen text="Curating your local news..." color="#4648D4" colorScheme="dark" />
      </View>
    );
  }

  return (
    <View 
      style={styles.container}
      onLayout={(e) => setScrollHeight(e.nativeEvent.layout.height)}
    >
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Main Snap Scrolling Feed */}
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

      {/* Overlay Header */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.65)', 'rgba(0, 0, 0, 0.3)', 'transparent']}
        style={[styles.headerGradient, { paddingTop: insets.top + Spacing.sm }]}
        pointerEvents="box-none"
      >
        <View style={styles.headerBar}>
          {/* Left Stack */}
          <View style={styles.leftStack}>
            {/* Round back / menu button */}
            <TouchableOpacity 
              style={styles.circleButton} 
              activeOpacity={0.7}
              onPress={() => setIsMenuVisible(true)}
            >
              <Ionicons name="menu" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

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
    backgroundColor: '#000000',
  },
  darkLoaderContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 18,
    height: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: 'Inter_700Bold',
  },
  profileBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 2,
    backgroundColor: '#DCE9FF',
    ...Shadows.md,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  saveIcon: {
    width: 16,
    height: 20,
  },
});