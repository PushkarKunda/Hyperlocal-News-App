import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { IMMERSIVE_NEWS } from '@/data/mockImmersiveNews';
import { ImmersiveNewsCard } from '@/components/ImmersiveNewsCard';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [scrollHeight, setScrollHeight] = useState(screenHeight);
  const [categoryBookmarked, setCategoryBookmarked] = useState(false);

  // Load Figma header icon assets (PNG is fully supported, SVGs migrated to vector icons)
  const userPhoto = require('@/assets/immersive_feed/f8a7444eb4e0445e94186837bf33bd7f2f8b5681.png');

  return (
    <View 
      style={styles.container}
      onLayout={(e) => setScrollHeight(e.nativeEvent.layout.height)}
    >
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Main Snap Scrolling Feed */}
      <FlatList
        data={IMMERSIVE_NEWS}
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
              onPress={() => router.push('/(tabs)/menu' as any)}
            >
              <Ionicons name="menu" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Header Title */}
            <Text style={styles.headerTitle}>TECH INSIDER</Text>

            {/* User Profile */}
            <TouchableOpacity 
              style={styles.profileBorder}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/profile' as any)}
            >
              <Image source={userPhoto} style={styles.profileImage} contentFit="cover" />
            </TouchableOpacity>
          </View>

          {/* Right Save Action */}
          <TouchableOpacity 
            style={styles.circleButton} 
            activeOpacity={0.7}
            onPress={() => setCategoryBookmarked(!categoryBookmarked)}
          >
            <Ionicons 
              name={categoryBookmarked ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color={categoryBookmarked ? "#FFAC33" : "#FFFFFF"} 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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