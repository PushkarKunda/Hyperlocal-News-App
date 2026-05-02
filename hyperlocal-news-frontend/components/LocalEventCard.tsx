import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export interface LocalEventItem {
  id: string;
  category: string;
  title: string;
  distance: string;
  schedule: string;
  mapImageUrl: string;
}

interface LocalEventCardProps {
  item: LocalEventItem;
  onPress?: () => void;
  onRemindMe?: () => void;
}

export function LocalEventCard({ item, onPress, onRemindMe }: LocalEventCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.category, { color: colors.primary }]}>{item.category.toUpperCase()}</Text>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        <View style={[styles.distanceBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.distanceText, { color: colors.primary }]}>{item.distance}</Text>
        </View>
      </View>

      <View style={[styles.mapContainer, { backgroundColor: '#e2e8f0' }]}>
        <Image source={{ uri: item.mapImageUrl }} style={styles.mapImage} opacity={0.6} />
        <View style={[styles.mapMarker, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
          <MaterialIcons name="location-on" size={14} color="#FFF" />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.scheduleText, { color: colors.textSecondary }]}>{item.schedule}</Text>
        <TouchableOpacity style={styles.remindButton} onPress={onRemindMe}>
          <Text style={[styles.remindText, { color: colors.primary }]}>Remind Me</Text>
          <MaterialIcons name="notifications-none" size={12} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 17,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  distanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  mapContainer: {
    height: 128,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: 10,
    fontWeight: '400',
  },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  remindText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
