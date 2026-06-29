// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Alert } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useAppColorScheme } from '@/hooks/useAppColorScheme';
// import { useRouter } from 'expo-router';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { Colors } from '@/constants/Colors';
// import { Spacing, BorderRadius } from '@/constants/Spacing';
// import { CreateEventModal } from '@/components/CreateEventModal';

// import { useAuthStore } from '@/store/authStore';
// import { StatusBar } from 'expo-status-bar';

// interface CustomEventItem {
//   id: string;
//   category: string;
//   title: string;
//   description: string;
//   distance: string;
//   schedule: string;
//   locationName: string;
//   imageUrl: string;
//   dateMonth: string;
//   dateDay: string;
// }

// import { useEventsList } from '@/hooks/useApi';
// import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// export default function EventsScreen() {
//   const colorScheme = useAppColorScheme();
//   const colors = Colors[colorScheme ?? 'light'];
//   const insets = useSafeAreaInsets();
//   const router = useRouter();

//   const { data: apiEvents = [], isLoading } = useEventsList();
//   const [eventsList, setEventsList] = useState<CustomEventItem[]>([]);
//   const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
//   const [activeTab, setActiveTab] = useState<'all' | 'today' | 'week'>('all');
//   const [reminders, setReminders] = useState<Record<string, boolean>>({});
//   const [interested, setInterested] = useState<Record<string, boolean>>({});

//   const { user } = useAuthStore();
//   const isPublisher = user?.isPublisher || false;
//   const [showGatedView, setShowGatedView] = useState(false);
//   const isDark = colorScheme === 'dark';

//   useEffect(() => {
//     if (apiEvents && apiEvents.length > 0) {
//       const mapped = apiEvents.map((item: any): CustomEventItem => {
//         let dateMonth = 'MAY';
//         let dateDay = '25';
//         try {
//           const d = new Date(item.date);
//           if (!isNaN(d.getTime())) {
//             dateMonth = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
//             dateDay = d.getDate().toString();
//           }
//         } catch {}

//         return {
//           id: String(item.id),
//           category: typeof item.category === 'object' && item.category !== null ? item.category.name : String(item.category ?? 'Community'),
//           title: item.title ?? 'Untitled Event',
//           description: item.description ?? '',
//           distance: item.distance ?? '0.5 km away',
//           schedule: item.schedule ?? `${item.date || ''} • ${item.time || ''}`,
//           locationName: item.locationName ?? item.location?.name ?? 'Community Center',
//           imageUrl: item.imageUrl ?? 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600',
//           dateMonth,
//           dateDay,
//         };
//       });
//       setEventsList(mapped);
//     }
//   }, [apiEvents]);

//   const handleAddEvent = (eventData: {
//     title: string;
//     description: string;
//     category: string;
//     locationName: string;
//     imageUrl: string;
//     date: string;
//     time: string;
//     neighborhood: string;
//   }) => {
//     let dateMonth = 'MAY';
//     let dateDay = '28';
    
//     // Parse month and day from inputs like "Sat, May 25"
//     const match = eventData.date.match(/(?:[a-zA-Z]{3})?,?\s*([a-zA-Z]{3,})\s+(\d+)/i);
//     if (match) {
//       dateMonth = match[1].substring(0, 3).toUpperCase();
//       dateDay = match[2];
//     } else {
//       const dayMatch = eventData.date.match(/\d+/);
//       if (dayMatch) dateDay = dayMatch[0];
//     }

//     const newEvent: CustomEventItem = {
//       id: Date.now().toString(),
//       category: eventData.category,
//       title: eventData.title,
//       description: eventData.description,
//       distance: '0.1 km away',
//       schedule: `${eventData.date} • ${eventData.time}`,
//       locationName: `${eventData.locationName}, ${eventData.neighborhood}`,
//       imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600',
//       dateMonth,
//       dateDay,
//     };

//     setEventsList(prev => [newEvent, ...prev]);
//   };

//   if (isLoading) {
//     return (
//       <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
//         <LoadingSpinner fullScreen text="Discovering nearby community meetups..." colorScheme={colorScheme ?? 'light'} />
//       </View>
//     );
//   }

//   const toggleReminder = (id: string) => {
//     setReminders((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const toggleInterested = (id: string) => {
//     setInterested((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const filteredEvents = eventsList.filter((event) => {
//     if (activeTab === 'today') {
//       return event.id === '1' || Number(event.id) > 1700000000000;
//     }
//     if (activeTab === 'week') {
//       return event.id === '1' || event.id === '2' || Number(event.id) > 1700000000000;
//     }
//     return true;
//   });

//   if (showGatedView && !isPublisher) {
//     return (
//       <View style={[styles.gatedContainer, { backgroundColor: colors.background }]}>
//         <StatusBar style={isDark ? 'light' : 'dark'} />
        
//         {/* Header */}
//         <View style={[styles.gatedHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(12, insets.top) }]}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setShowGatedView(false)}
//             activeOpacity={0.7}
//           >
//             <Ionicons name="arrow-back" size={24} color={colors.text} />
//           </TouchableOpacity>
//           <Text style={[styles.gatedHeaderTitleText, { color: colors.text }]}>Publisher Access</Text>
//           <View style={styles.headerSpacer} />
//         </View>

//         <ScrollView contentContainerStyle={styles.gatedScroll} showsVerticalScrollIndicator={false}>
//           <View style={styles.gatedContent}>
//             <View style={[styles.gatedIconCircle, { backgroundColor: colors.primaryLight }]}>
//               <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
//             </View>

//             <Text style={[styles.gatedTitle, { color: colors.text }]}>Verify your Gmail</Text>
//             <Text style={[styles.gatedSubtitle, { color: colors.textSecondary }]}>
//               To write articles and host events in your local community, you must verify your Gmail address to establish your publisher identity.
//             </Text>

//             <View style={styles.featuresList}>
//               <View style={styles.featureItem}>
//                 <View style={[styles.featureIconContainer, { backgroundColor: colors.primaryLight }]}>
//                   <Ionicons name="document-text" size={20} color={colors.primary} />
//                 </View>
//                 <View style={styles.featureTextContainer}>
//                   <Text style={[styles.featureTitleText, { color: colors.text }]}>Write Local Stories</Text>
//                   <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Share news, updates, and stories impacting your neighborhood.</Text>
//                 </View>
//               </View>

//               <View style={styles.featureItem}>
//                 <View style={[styles.featureIconContainer, { backgroundColor: colors.primaryLight }]}>
//                   <Ionicons name="calendar" size={20} color={colors.primary} />
//                 </View>
//                 <View style={styles.featureTextContainer}>
//                   <Text style={[styles.featureTitleText, { color: colors.text }]}>Host Local Events</Text>
//                   <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Organize and promote nearby community meetups & activities.</Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity
//               style={[styles.gatedButton, { backgroundColor: colors.primary }]}
//               onPress={() => router.push('/(onboarding)/edit-profile')}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.gatedButtonText}>Verify Gmail Now</Text>
//               <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.gatedSecondaryButton}
//               onPress={() => setShowGatedView(false)}
//               activeOpacity={0.7}
//             >
//               <Text style={[styles.gatedSecondaryButtonText, { color: colors.textSecondary }]}>Go Back</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
//       <StatusBar style={isDark ? 'light' : 'dark'} />

//       {/* Header */}
//       <View style={[styles.header, { borderBottomColor: colors.border }]}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           activeOpacity={0.7}
//           style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
//         >
//           <Ionicons name="arrow-back" size={22} color={colors.text} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: colors.text }]}>Events</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       {/* Coming Soon Container */}
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
//         <View style={{ backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)', width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
//           <Ionicons name="calendar-outline" size={48} color="#8B5CF6" />
//         </View>
//         <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', fontFamily: 'Poppins_700Bold', marginBottom: 12, textAlign: 'center' }}>Coming Soon</Text>
//         <Text style={{ color: colors.textSecondary, fontSize: 15, fontFamily: 'Poppins_500Medium', textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
//           Our team is busy building the backend service for community events and meetups. Get ready to connect with your local neighbors soon!
//         </Text>
//         <TouchableOpacity
//           style={{ backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
//           onPress={() => router.back()}
//           activeOpacity={0.8}
//         >
//           <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'Poppins_700Bold' }}>Go Back</Text>
//           <Ionicons name="arrow-back" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//   },
//   menuButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     fontFamily: 'Poppins_700Bold',
//   },
//   createButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tabContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//   },
//   segmentedControl: {
//     flexDirection: 'row',
//     borderRadius: 12,
//     borderWidth: 1,
//     padding: 4,
//     height: 48,
//   },
//   tabButton: {
//     flex: 1,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   activeTabButton: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   tabText: {
//     fontSize: 13,
//     fontWeight: '600',
//     fontFamily: 'Poppins_600SemiBold',
//   },
//   listContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 40,
//     gap: 20,
//   },
//   eventCard: {
//     borderRadius: BorderRadius.lg,
//     borderWidth: 1,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.03,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   imageContainer: {
//     height: 180,
//     width: '100%',
//     position: 'relative',
//   },
//   eventImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   dateBadge: {
//     position: 'absolute',
//     top: 14,
//     left: 14,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 8,
//     width: 48,
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   dateMonth: {
//     color: '#4648D4',
//     fontSize: 10,
//     fontWeight: '800',
//     fontFamily: 'Poppins_700Bold',
//     letterSpacing: 0.5,
//   },
//   dateDay: {
//     color: '#0F172A',
//     fontSize: 18,
//     fontWeight: '800',
//     fontFamily: 'Poppins_700Bold',
//     marginTop: -2,
//   },
//   distanceBadge: {
//     position: 'absolute',
//     bottom: 14,
//     right: 14,
//     backgroundColor: 'rgba(15, 23, 42, 0.75)',
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//   },
//   distanceText: {
//     color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: '700',
//     fontFamily: 'Poppins_600SemiBold',
//   },
//   cardContent: {
//     padding: 16,
//     gap: 8,
//   },
//   categoryText: {
//     fontSize: 10,
//     fontWeight: '800',
//     fontFamily: 'Poppins_700Bold',
//     letterSpacing: 0.5,
//   },
//   eventTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     fontFamily: 'Poppins_700Bold',
//     lineHeight: 24,
//   },
//   eventDescription: {
//     fontSize: 13,
//     fontFamily: 'Poppins_500Medium',
//     lineHeight: 18,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginTop: 2,
//   },
//   detailText: {
//     fontSize: 12,
//     fontFamily: 'Poppins_500Medium',
//     flex: 1,
//   },
//   cardFooter: {
//     flexDirection: 'row',
//     gap: 12,
//     borderTopWidth: 1,
//     paddingTop: 14,
//     marginTop: 6,
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     height: 38,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 6,
//   },
//   actionButtonText: {
//     fontSize: 13,
//     fontWeight: '600',
//     fontFamily: 'Poppins_600SemiBold',
//   },
//   // Gated UI Styles
//   gatedContainer: {
//     flex: 1,
//   },
//   gatedHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//   },
//   gatedHeaderTitleText: {
//     fontSize: 18,
//     fontWeight: '700',
//     fontFamily: 'Poppins_700Bold',
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerSpacer: {
//     width: 40,
//   },
//   gatedScroll: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     padding: 24,
//   },
//   gatedContent: {
//     alignItems: 'center',
//     gap: 16,
//   },
//   gatedIconCircle: {
//     width: 96,
//     height: 96,
//     borderRadius: 48,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   gatedTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//     fontFamily: 'Poppins_700Bold',
//     textAlign: 'center',
//   },
//   gatedSubtitle: {
//     fontSize: 15,
//     fontFamily: 'Poppins_500Medium',
//     lineHeight: 22,
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   featuresList: {
//     width: '100%',
//     gap: 20,
//     marginBottom: 24,
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 14,
//   },
//   featureIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   featureTextContainer: {
//     flex: 1,
//     gap: 4,
//   },
//   featureTitleText: {
//     fontSize: 16,
//     fontWeight: '700',
//     fontFamily: 'Poppins_700Bold',
//   },
//   featureDesc: {
//     fontSize: 13,
//     fontFamily: 'Poppins_400Regular',
//     lineHeight: 18,
//   },
//   gatedButton: {
//     width: '100%',
//     height: 52,
//     borderRadius: 26,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   gatedButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//     fontFamily: 'Poppins_700Bold',
//   },
//   gatedSecondaryButton: {
//     width: '100%',
//     height: 48,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   gatedSecondaryButtonText: {
//     fontSize: 15,
//     fontWeight: '600',
//     fontFamily: 'Poppins_600SemiBold',
//   },
// });
