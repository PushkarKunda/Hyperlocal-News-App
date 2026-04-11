import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { NewsCard } from '@/components/NewsCard';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { MOCK_NEWS } from '@/data/mockNews';
import { formatTimeAgo } from '@/utils/formatters';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [scrollHeight, setScrollHeight] = useState(0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <View 
        style={styles.feedContainer} 
        onLayout={(e) => setScrollHeight(e.nativeEvent.layout.height)}
      >
        {scrollHeight > 0 && (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            pagingEnabled
            snapToInterval={scrollHeight}
            decelerationRate="fast"
          >
            {MOCK_NEWS.map((item) => (
              <NewsCard 
                key={item.id}
                item={item}
                containerHeight={scrollHeight}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  feedContainer: {
    flex: 1,
  }
});