import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ImmersiveArticle } from '@/data/mockImmersiveNews';
import { Spacing, BorderRadius } from '@/constants/Spacing';

const { width: screenWidth } = Dimensions.get('window');

interface ImmersiveNewsCardProps {
  item: ImmersiveArticle;
  containerHeight: number;
}

export function ImmersiveNewsCard({ item, containerHeight }: ImmersiveNewsCardProps) {
  // Local interaction states
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  // Dynamic category bullet icon
  const getBulletIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'TECH':
        return <Ionicons name="flash" size={16} color="#4648D4" style={styles.bulletIcon} />;
      case 'DESIGN':
        return <Ionicons name="color-palette" size={16} color="#006A61" style={styles.bulletIcon} />;
      case 'SCIENCE':
        return <Ionicons name="leaf" size={16} color="#B90538" style={styles.bulletIcon} />;
      default:
        return <Ionicons name="ellipse" size={8} color="#767586" style={styles.bulletIcon} />;
    }
  };

  // Icon mapping for action buttons based on interaction state
  const likeIconName = liked ? 'heart' : 'heart-outline';
  const likeIconColor = liked ? '#FF4A6B' : '#464554';
  
  const saveIconName = bookmarked ? 'bookmark' : 'bookmark-outline';
  const saveIconColor = bookmarked ? '#FFAC33' : '#464554';

  return (
    <View style={[styles.cardContainer, { height: containerHeight }]}>
      {/* Top 45% Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={item.image}
          style={styles.image}
          contentFit="cover"
          transition={400}
        />
        {/* Category Tag */}
        <View style={[styles.categoryTag, { backgroundColor: item.categoryColor }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      {/* Bottom 55% Content Section */}
      <View style={styles.contentContainer}>
        <View style={styles.textWrapper}>
          {/* Headline */}
          <Text style={styles.headline}>{item.headline}</Text>

          {/* Bullet Points List */}
          <View style={styles.pointsList}>
            {item.points.map((point, index) => (
              <View key={index} style={styles.pointRow}>
                {getBulletIcon(item.category)}
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer Area */}
        <View style={styles.footerWrapper}>
          {/* Divider */}
          <View style={styles.divider} />

          <View style={styles.footerRow}>
            {/* Reading Time */}
            <View style={styles.readTimeContainer}>
              <Ionicons name="time-outline" size={16} color="#767586" />
              <Text style={styles.readTimeText}>{item.readTime}</Text>
            </View>

            {/* Action Buttons Stack */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.65}
                onPress={() => setLiked(!liked)}
              >
                <Ionicons name={likeIconName} size={16} color={likeIconColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.65}>
                <Ionicons name="share-social-outline" size={16} color="#464554" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.65}
                onPress={() => setBookmarked(!bookmarked)}
              >
                <Ionicons name={saveIconName} size={16} color={saveIconColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.65}>
                <Feather name="more-vertical" size={16} color="#464554" />
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
    backgroundColor: '#F8F9FF',
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
    backgroundColor: '#F8F9FF',
  },
  textWrapper: {
    flex: 1,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B1C30',
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
    color: '#464554',
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
  },
  footerWrapper: {
    marginTop: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(199, 196, 215, 0.3)',
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
    color: '#767586',
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
    backgroundColor: '#E5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
