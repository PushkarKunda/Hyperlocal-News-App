import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Spacing';

interface NotificationItem {
  id: string;
  type: 'breaking' | 'update' | 'poll' | 'reminder';
  title: string;
  body: string;
  time: string;
  unread: boolean;
  section: 'Today' | 'Earlier';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'breaking',
    title: 'Breaking: Main St. Closed Today',
    body: 'Heavy parade activity and construction updates on Main Street. Plan your commute accordingly.',
    time: '5m ago',
    unread: true,
    section: 'Today',
  },
  {
    id: '2',
    type: 'update',
    title: 'New Community Park Opening',
    body: 'The brand new Westside Green community park is now open to the public with modern amenities!',
    time: '45m ago',
    unread: true,
    section: 'Today',
  },
  {
    id: '3',
    type: 'poll',
    title: 'Poll Results Are In!',
    body: '80% of neighbors in Kukatpally voted in favor of introducing more designated bike lanes on main streets.',
    time: '4h ago',
    unread: false,
    section: 'Earlier',
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Community Town Hall Reminder',
    body: 'The monthly ward development discussion is starting in 1 hour at the City Library Seminar Hall.',
    time: '1d ago',
    unread: false,
    section: 'Earlier',
  },
];

export default function NotificationsScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: !item.unread } : item))
    );
  };

  const getIconDetails = (type: NotificationItem['type']) => {
    switch (type) {
      case 'breaking':
        return {
          name: 'megaphone-outline',
          lib: 'Ionicons',
          bg: '#FEE2E2',
          iconColor: '#EF4444',
        };
      case 'update':
        return {
          name: 'park',
          lib: 'MaterialIcons',
          bg: '#DCFCE7',
          iconColor: '#22C55E',
        };
      case 'poll':
        return {
          name: 'bar-chart-2',
          lib: 'Feather',
          bg: colors.primaryLight,
          iconColor: colors.primary,
        };
      case 'reminder':
        return {
          name: 'calendar-outline',
          lib: 'Ionicons',
          bg: '#FEF3C7',
          iconColor: '#F59E0B',
        };
    }
  };

  const renderIcon = (type: NotificationItem['type']) => {
    const details = getIconDetails(type);
    const size = 20;
    
    if (details.lib === 'MaterialIcons') {
      return <MaterialIcons name={details.name as any} size={size} color={details.iconColor} />;
    }
    if (details.lib === 'Feather') {
      return <Feather name={details.name as any} size={size} color={details.iconColor} />;
    }
    return <Ionicons name={details.name as any} size={size} color={details.iconColor} />;
  };

  const renderNotificationCard = (item: NotificationItem) => {
    const details = getIconDetails(item.type);
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.notificationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => toggleReadStatus(item.id)}
        activeOpacity={0.75}
      >
        {/* Unread Indicator Dot */}
        <View style={styles.unreadColumn}>
          {item.unread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>

        {/* Icon container */}
        <View style={[styles.iconWrapper, { backgroundColor: details.bg }]}>
          {renderIcon(item.type)}
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.timeText, { color: colors.textTertiary }]}>{item.time}</Text>
          </View>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const todayNotifications = notifications.filter((item) => item.section === 'Today');
  const earlierNotifications = notifications.filter((item) => item.section === 'Earlier');

  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.badgeContainer, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={[styles.markReadText, { color: colors.primary }]}>Mark Read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Main List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Today Group */}
        {todayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>NEW</Text>
            <View style={styles.listContainer}>
              {todayNotifications.map(renderNotificationCard)}
            </View>
          </View>
        )}

        {/* Earlier Group */}
        {earlierNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>EARLIER</Text>
            <View style={styles.listContainer}>
              {earlierNotifications.map(renderNotificationCard)}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  badgeContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
  },
  markReadText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: 'Inter_700Bold',
    marginLeft: 4,
  },
  listContainer: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadColumn: {
    width: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    flex: 1,
    paddingRight: 8,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  cardBody: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    lineHeight: 18,
  },
});
