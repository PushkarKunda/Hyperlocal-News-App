import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import MenuOptions from '@/components/MenuOptions';

interface MenuBookmarkItem {
  id: string;
  category: 'TECH' | 'HEALTH' | 'BUSINESS';
  title: string;
  description: string;
  imageUrl: string;
  timeAgo: string;
  reads: string;
}

const INITIAL_BOOKMARKS: MenuBookmarkItem[] = [
  {
    id: '1',
    category: 'TECH',
    title: 'The Future of Quantum Computing in Global Financial Systems',
    description: 'Emerging research suggests that quantum-resistant encryption will become the primary protocol for secure digital asset transactions within the decade.',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    timeAgo: '2h ago',
    reads: '4.2k reads',
  },
  {
    id: '2',
    category: 'HEALTH',
    title: 'New Breakthrough in Sustainable Mental Wellness Platforms',
    description: 'Scientists have developed a new framework for digital therapeutic intervention that targets stress levels and reduces cognitive fatigue over continuous use.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    timeAgo: '5h ago',
    reads: '1.8k reads',
  },
  {
    id: '3',
    category: 'BUSINESS',
    title: 'Global Markets Shift Towards Decentralized Assets',
    description: 'Recent reports indicate a 40% increase in institutional interest for digital assets as secondary reserve currencies, driving significant regulatory shifts.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
    timeAgo: '1d ago',
    reads: '12.5k reads',
  },
];

const CATEGORIES = [
  { label: 'All Items', value: 'all' },
  { label: 'Technology', value: 'TECH' },
  { label: 'Health', value: 'HEALTH' },
  { label: 'Business', value: 'BUSINESS' },
];

export default function MenuBookmarksScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Screen states
  const [bookmarks, setBookmarks] = useState<MenuBookmarkItem[]>(INITIAL_BOOKMARKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Add Custom Bookmark Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'TECH' | 'HEALTH' | 'BUSINESS'>('TECH');

  // Remove individual bookmark
  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // Add dynamic custom bookmark
  const handleAddBookmark = () => {
    if (!newTitle.trim() || !newDesc.trim()) return;

    // Pick random relevant high-quality image based on category choice
    let imgUrl = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600';
    if (newCategory === 'TECH') {
      imgUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600';
    } else if (newCategory === 'HEALTH') {
      imgUrl = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600';
    } else if (newCategory === 'BUSINESS') {
      imgUrl = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600';
    }

    const newItem: MenuBookmarkItem = {
      id: Date.now().toString(),
      category: newCategory,
      title: newTitle.trim(),
      description: newDesc.trim(),
      imageUrl: imgUrl,
      timeAgo: 'Just now',
      reads: '100 reads',
    };

    setBookmarks((prev) => [newItem, ...prev]);
    // Reset modal inputs
    setNewTitle('');
    setNewDesc('');
    setNewCategory('TECH');
    setIsAddModalVisible(false);
  };

  // Filtered bookmark list logic
  const filteredBookmarks = bookmarks.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111122' : '#F8F9FF', paddingTop: insets.top }]}>
      
      {/* Header - Top App Bar */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#374151' : '#E2E8F0' }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setIsMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={24} color={isDark ? '#FFFFFF' : '#0B1C30'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#0B1C30' }]}>Bookmarks</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push('/(tabs)/discover')}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={22} color={isDark ? '#FFFFFF' : '#0B1C30'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={isDark ? '#FFFFFF' : '#0B1C30'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Block Container */}
        <View style={styles.searchSection}>
          <View style={[styles.searchInputContainer, { backgroundColor: isDark ? '#1A1A35' : '#EFF4FF' }]}>
            <Ionicons name="search" size={18} color={isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(70, 69, 84, 0.6)'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#0B1C30' }]}
              placeholder="Search saved stories..."
              placeholderTextColor={isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(70, 69, 84, 0.6)'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Filter Categories Chips */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.chipButton,
                    {
                      backgroundColor: isActive
                        ? '#6063EE'
                        : isDark
                        ? '#1A1A35'
                        : '#E5EEFF',
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isActive
                          ? '#FFFFFF'
                          : isDark
                          ? '#94A3B8'
                          : '#464554',
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Vertical Bento Bookmarks List */}
        {filteredBookmarks.length > 0 ? (
          <View style={styles.bookmarksList}>
            {filteredBookmarks.map((item) => {
              // Custom category styles based on the type
              let categoryBg = 'rgba(70, 72, 212, 0.1)';
              let categoryColor = '#4648D4';
              if (item.category === 'HEALTH') {
                categoryBg = 'rgba(0, 106, 97, 0.1)';
                categoryColor = '#006A61';
              } else if (item.category === 'BUSINESS') {
                categoryBg = 'rgba(185, 5, 56, 0.1)';
                categoryColor = '#B90538';
              }

              // Adjust category background in dark mode
              if (isDark) {
                if (item.category === 'TECH') categoryBg = 'rgba(70, 72, 212, 0.25)';
                if (item.category === 'HEALTH') categoryBg = 'rgba(0, 106, 97, 0.25)';
                if (item.category === 'BUSINESS') categoryBg = 'rgba(185, 5, 56, 0.25)';
              }

              return (
                <View
                  key={item.id}
                  style={[
                    styles.articleCard,
                    {
                      backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                      borderColor: isDark ? '#2E2E48' : '#F0F3FA',
                    },
                  ]}
                >
                  {/* Article rounded cover photo */}
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.cardImage}
                      contentFit="cover"
                    />
                  </View>

                  {/* Card Content details */}
                  <View style={styles.cardInfoContainer}>
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.categoryBadge, { backgroundColor: categoryBg }]}>
                        <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                          {item.category}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        style={styles.bookmarkIconButton}
                        onPress={() => toggleBookmark(item.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="bookmark" size={20} color="#4648D4" />
                      </TouchableOpacity>
                    </View>

                    {/* Heading Text */}
                    <Text style={[styles.articleTitle, { color: isDark ? '#FFFFFF' : '#0B1C30' }]} numberOfLines={2}>
                      {item.title}
                    </Text>

                    {/* Subtitle Description text */}
                    <Text style={[styles.articleDesc, { color: isDark ? '#94A3B8' : '#464554' }]} numberOfLines={2}>
                      {item.description}
                    </Text>

                    {/* Bottom Info metrics row */}
                    <View style={styles.cardMetaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={isDark ? '#94A3B8' : '#464554'} />
                        <Text style={[styles.metaItemText, { color: isDark ? '#94A3B8' : '#464554' }]}>
                          {item.timeAgo}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="eye-outline" size={14} color={isDark ? '#94A3B8' : '#464554'} />
                        <Text style={[styles.metaItemText, { color: isDark ? '#94A3B8' : '#464554' }]}>
                          {item.reads}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* High quality Empty State */
          <View style={styles.emptyStateContainer}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: isDark ? 'rgba(70, 72, 212, 0.15)' : 'rgba(70, 72, 212, 0.08)' }]}>
              <Ionicons name="bookmark-outline" size={48} color="#4648D4" />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#0B1C30' }]}>No Saved Stories</Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {searchQuery
                ? `No results match "${searchQuery}". Please try another keyword.`
                : 'Tap the bookmark icon on any news feed cards or local events to save stories here.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) for custom bookmark creation */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setIsAddModalVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add New Custom Bookmark Modal Form */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardAvoiding}
          >
            <View style={[styles.modalSheet, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#0B1C30' }]}>Add to Bookmarks</Text>
                <TouchableOpacity
                  onPress={() => setIsAddModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color={isDark ? '#94A3B8' : '#464554'} />
                </TouchableOpacity>
              </View>

              {/* Title Input field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#464554' }]}>Title</Text>
                <TextInput
                  style={[styles.formInput, {
                    color: isDark ? '#FFFFFF' : '#0B1C30',
                    backgroundColor: isDark ? '#111122' : '#F1F5F9',
                    borderColor: isDark ? '#2E2E48' : '#E2E8F0'
                  }]}
                  placeholder="Enter story title..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              {/* Description Input field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#464554' }]}>Description Summary</Text>
                <TextInput
                  style={[styles.formInput, styles.textAreaInput, {
                    color: isDark ? '#FFFFFF' : '#0B1C30',
                    backgroundColor: isDark ? '#111122' : '#F1F5F9',
                    borderColor: isDark ? '#2E2E48' : '#E2E8F0'
                  }]}
                  placeholder="Enter a brief summary description..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={newDesc}
                  onChangeText={setNewDesc}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              {/* Category selector row */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#464554' }]}>Category</Text>
                <View style={styles.modalCategoryRow}>
                  {(['TECH', 'HEALTH', 'BUSINESS'] as const).map((cat) => {
                    const isSel = newCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.modalCategoryButton,
                          {
                            backgroundColor: isSel
                              ? '#4648D4'
                              : isDark
                              ? '#111122'
                              : '#F1F5F9',
                            borderColor: isSel ? '#4648D4' : isDark ? '#2E2E48' : '#E2E8F0',
                          },
                        ]}
                        onPress={() => setNewCategory(cat)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.modalCategoryButtonText,
                            {
                              color: isSel ? '#FFFFFF' : isDark ? '#94A3B8' : '#464554',
                              fontWeight: isSel ? '700' : '500',
                            },
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Action save button */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { opacity: newTitle.trim() && newDesc.trim() ? 1 : 0.6 },
                ]}
                onPress={handleAddBookmark}
                disabled={!newTitle.trim() || !newDesc.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Add Bookmark</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Slide drawer menu overlay options */}
      <MenuOptions isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 9999,
  },
  scrollContent: {
    paddingTop: 12,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  filtersWrapper: {
    marginBottom: 24,
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chipButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  bookmarksList: {
    paddingHorizontal: 20,
    gap: 24,
  },
  articleCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: 'rgba(63, 63, 70, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  cardImageContainer: {
    height: 196.88,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardInfoContainer: {
    padding: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
  },
  bookmarkIconButton: {
    padding: 4,
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    lineHeight: 28,
    marginBottom: 8,
  },
  articleDesc: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22.75,
    marginBottom: 16,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  emptyStateContainer: {
    paddingHorizontal: 32,
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    lineHeight: 20,
  },
  fabButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4648D4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'flex-end',
  },
  modalKeyboardAvoiding: {
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    gap: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(199, 196, 215, 0.2)',
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  formInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  textAreaInput: {
    height: 96,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  modalCategoryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCategoryButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCategoryButtonText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  saveButton: {
    height: 48,
    backgroundColor: '#4648D4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
