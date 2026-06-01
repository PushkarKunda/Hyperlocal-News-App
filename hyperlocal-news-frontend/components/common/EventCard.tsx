import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Event } from '@/types';
import { format } from 'date-fns';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const eventDate = new Date(event.date);
  const month = format(eventDate, 'MMM');
  const day = format(eventDate, 'dd');

  return (
    <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={onPress}>
      <Image source={{ uri: event.imageUrl }} style={styles.image} />
      
      <View style={[styles.dateBadge, { backgroundColor: colors.surface }]}>
        <Text style={[styles.dateMonth, { color: colors.primary }]}>{month}</Text>
        <Text style={[styles.dateDay, { color: colors.text }]}>{day}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.category, { color: event.category.color || colors.primary }]}>
          {event.category.name}
        </Text>
        
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.infoRow}>
          <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {event.time}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.location.name}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  dateBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
});
