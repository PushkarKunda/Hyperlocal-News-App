import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { NewsArticle } from '@/types';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

const { width: screenWidth } = Dimensions.get('window');

interface ImmersiveNewsCardProps {
  item: NewsArticle;
  containerHeight: number;
}

export function ImmersiveNewsCard({ item, containerHeight }: ImmersiveNewsCardProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // Local interaction states
  const [liked, setLiked] = useState(item.isBookmarked ?? false);
  const [bookmarked, setBookmarked] = useState(item.isBookmarked ?? false);
  
  // Split the summary into sentences for bullet points
  const points = item.summary
    .split('. ')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.endsWith('.') ? s : s + '.');
  
  // Dynamic category bullet icon with corresponding colors
  const getBulletIcon = (categoryName: string, color: string) => {
    switch (categoryName.toUpperCase()) {
      case 'TECHNOLOGY':
        return <Ionicons name="flash" size={16} color={color} style={styles.bulletIcon} />;
      case 'BUSINESS':
        return <Ionicons name="trending-up" size={16} color={color} style={styles.bulletIcon} />;
      case 'LOCAL':
        return <Ionicons name="location" size={16} color={color} style={styles.bulletIcon} />;
      case 'SPORTS':
        return <Ionicons name="football" size={16} color={color} style={styles.bulletIcon} />;
      case 'HEALTH':
        return <Ionicons name="heart" size={16} color={color} style={styles.bulletIcon} />;
      default:
        return <Ionicons name="ellipse" size={8} color={color} style={styles.bulletIcon} />;
    }
  };

  // Icon mapping for action buttons based on interaction state
  const likeIconName = liked ? 'heart' : 'heart-outline';
  const likeIconColor = liked ? '#FF4A6B' : (isDark ? '#94A3B8' : '#464554');
  
  const saveIconName = bookmarked ? 'bookmark' : 'bookmark-outline';
  const saveIconColor = bookmarked ? '#FFAC33' : (isDark ? '#94A3B8' : '#464554');

  const actionIconColor = isDark ? '#94A3B8' : '#464554';

  return (
    <View style={[styles.cardContainer, { height: containerHeight, backgroundColor: colors.background }]}>
      {/* Top 45% Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={400}
        />
        {/* Category Tag */}
        <View style={[styles.categoryTag, { backgroundColor: item.category.color || '#4648D4' }]}>
          <Text style={styles.categoryText}>{item.category.name}</Text>
        </View>
      </View>

      {/* Bottom 55% Content Section */}
      <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
        <View style={styles.textWrapper}>
          {/* Headline */}
          <Text style={[styles.headline, { color: colors.text }]}>{item.headline}</Text>

          {/* Bullet Points List */}
          <View style={styles.pointsList}>
            {points.map((point, index) => (
              <View key={index} style={styles.pointRow}>
                {getBulletIcon(item.category.name, item.category.color || '#4648D4')}
                <Text style={[styles.pointText, { color: colors.textSecondary }]}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer Area */}
        <View style={styles.footerWrapper}>
          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.footerRow}>
            {/* Reading Time */}
            <View style={styles.readTimeContainer}>
              <Ionicons name="time-outline" size={16} color={colors.textTertiary} />
              <Text style={[styles.readTimeText, { color: colors.textSecondary }]}>{item.readTime}</Text>
            </View>

            {/* Action Buttons Stack */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#262636' : '#E5EEFF' }]} 
                activeOpacity={0.65}
                onPress={() => setLiked(!liked)}
              >
                <Ionicons name={likeIconName} size={16} color={likeIconColor} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#262636' : '#E5EEFF' }]} 
                activeOpacity={0.65}
              >
                <Ionicons name="share-social-outline" size={16} color={actionIconColor} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#262636' : '#E5EEFF' }]} 
                activeOpacity={0.65}
                onPress={() => setBookmarked(!bookmarked)}
              >
                <Ionicons name={saveIconName} size={16} color={saveIconColor} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#262636' : '#E5EEFF' }]} 
                activeOpacity={0.65}
              >
                <Feather name="more-vertical" size={16} color={actionIconColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: screenWidth,
  },
  imageContainer: {
    width: '100%',
    height: '45%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.lg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: 'Inter_700Bold',
  },
  contentContainer: {
    height: '55%',
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  textWrapper: {
    flex: 1,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    marginBottom: Spacing.lg,
    lineHeight: 32,
  },
  pointsList: {
    gap: Spacing.md,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletIcon: {
    marginTop: 3,
  },
  pointText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
  },
  footerWrapper: {
    marginTop: 'auto',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readTimeText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
