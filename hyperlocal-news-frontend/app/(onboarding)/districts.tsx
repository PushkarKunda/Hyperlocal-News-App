import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useDistrictsList } from '@/hooks/useApi';

const { width } = Dimensions.get('window');

interface DistrictCardProps {
  name: string;
  code?: string;
  isSelected: boolean;
  onPress: () => void;
}

function DistrictCard({ name, code, isSelected, onPress }: DistrictCardProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={styles.cardContainer}
    >
      <Animated.View
        style={[
          styles.card,
          isSelected ? styles.cardSelected : styles.cardUnselected,
          {
            backgroundColor: isSelected 
              ? (isDark ? '#2A2A4D' : '#E6E7FB') 
              : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
          { transform: [{ scale }] },
        ]}
      >
        <View 
          style={[
            styles.badgeCircle, 
            { 
              backgroundColor: isSelected ? colors.primary : (isDark ? '#2A2A3C' : '#F1F5F9'),
              borderColor: isSelected ? colors.primary : colors.border,
            }
          ]}
        >
          <Text style={[styles.badgeText, { color: isSelected ? '#FFFFFF' : colors.primary }]}>
            {code || name.substring(0, 3).toUpperCase()}
          </Text>
        </View>
        <Text 
          style={[
            styles.districtName, 
            { color: isSelected ? colors.primary : colors.text },
            isSelected && styles.districtNameSelected
          ]} 
          numberOfLines={1}
        >
          {name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function DistrictsScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { state } = useLocalSearchParams<{ state?: string }>();

  // Load districts dynamically using the React Query hook based on onboarding State selection
  const { data: districts = [], isLoading } = useDistrictsList(state);

  const isAP = state === 'ap';
  const stateLabel = isAP ? 'Andhra Pradesh' : 'Telangana';
  const defaultDistrictId = isAP ? 'visakhapatnam' : 'hyderabad';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrictId);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Set default selection when switching states or once dynamic districts are fetched
  useEffect(() => {
    if (districts.length > 0) {
      const hasDefault = districts.some(d => d.id === defaultDistrictId);
      setSelectedDistrict(hasDefault ? defaultDistrictId : districts[0].id);
    }
    setSearchQuery('');
  }, [state, districts, defaultDistrictId]);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const searchBorderAnim = useRef(new Animated.Value(0)).current;

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.timing(searchBorderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.timing(searchBorderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleContinuePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleContinuePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleContinue = () => {
    router.push('/(onboarding)/interests');
  };

  const filteredDistricts = districts.filter(district =>
    district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (district.code && district.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Interpolate search border colors dynamically based on active theme
  const searchBorderColor = searchBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Background Blurs */}
      <View style={[styles.purpleBlur, { backgroundColor: colorScheme === 'dark' ? 'rgba(70, 72, 212, 0.12)' : 'rgba(70, 72, 212, 0.05)' }]} />
      <View style={[styles.tealBlur, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 106, 97, 0.12)' : 'rgba(0, 106, 97, 0.05)' }]} />

      {/* Header Bar */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.primary }]}>HyperLocal</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Title */}
        <View style={styles.headlineSection}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>Which district?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select your district in {stateLabel} to get hyperlocal updates.
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Animated.View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.card,
                borderColor: searchBorderColor,
                shadowOpacity: isSearchFocused ? 0.15 : 0.05,
              }
            ]}
          >
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search district..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </Animated.View>
        </View>

        {/* District Selection Area */}
        <View style={styles.districtsSection}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>DISTRICTS OF {stateLabel.toUpperCase()}</Text>

          <View style={styles.gridContainer}>
            {filteredDistricts.map((district) => (
              <DistrictCard
                key={district.id}
                name={district.name}
                code={district.code}
                isSelected={selectedDistrict === district.id}
                onPress={() => setSelectedDistrict(district.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={styles.continueButton}
            onPress={handleContinue}
            onPressIn={handleContinuePressIn}
            onPressOut={handleContinuePressOut}
          >
            <Text style={styles.continueButtonText}>Confirm & Continue</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  purpleBlur: {
    position: 'absolute',
    right: -39,
    top: -98,
    width: 156,
    height: 393.59,
    borderRadius: 9999,
    backgroundColor: 'rgba(70, 72, 212, 0.05)',
    zIndex: -1,
  },
  tealBlur: {
    position: 'absolute',
    left: -19.5,
    bottom: -49.19,
    width: 117,
    height: 295.19,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 106, 97, 0.05)',
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(199, 196, 215, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4648D4',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  headlineSection: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0B1C30',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.64,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#464554',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  searchContainer: {
    marginBottom: 32,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#0B1C30',
    fontFamily: 'Inter_400Regular',
  },
  districtsSection: {
    gap: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#767586',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardContainer: {
    width: '47.5%',
    height: 120,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'solid',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: '#E6E7FB',
    borderColor: '#4648D4',
    borderStyle: 'solid',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  cardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderStyle: 'solid',
  },
  badgeCircle: {
    width: 52,
    height: 52,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E6E7FB',
  },
  badgeCircleSelected: {
    borderColor: '#4648D4',
    backgroundColor: '#4648D4',
    shadowOpacity: 0.15,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
  badgeTextUnselected: {
    color: '#4648D4',
  },
  districtName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0B1C30',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  districtNameSelected: {
    color: '#4648D4',
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: '#F8F9FF',
  },
  continueButton: {
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#4648D4',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 28,
  },
});
