import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  TextInput,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const US_FLAG = require('../../assets/immersive_feed/us_flag.png');
const UK_FLAG = require('../../assets/immersive_feed/uk_flag.png');
const IN_FLAG = require('../../assets/immersive_feed/in_flag.png');
const CA_FLAG = require('../../assets/immersive_feed/ca_flag.png');
const AU_FLAG = require('../../assets/immersive_feed/au_flag.png');

interface Region {
  id: string;
  name: string;
  flagImage?: any;
  isAllRegions?: boolean;
}

const POPULAR_REGIONS: Region[] = [
  { id: 'us', name: 'United States', flagImage: US_FLAG },
  { id: 'uk', name: 'United Kingdom', flagImage: UK_FLAG },
  { id: 'in', name: 'India', flagImage: IN_FLAG },
  { id: 'ca', name: 'Canada', flagImage: CA_FLAG },
  { id: 'au', name: 'Australia', flagImage: AU_FLAG },
  { id: 'all', name: 'All Regions', isAllRegions: true },
];

interface RegionCardProps {
  name: string;
  flagImage?: any;
  isAllRegions?: boolean;
  isSelected: boolean;
  onPress: () => void;
}

function RegionCard({ name, flagImage, isAllRegions, isSelected, onPress }: RegionCardProps) {
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
      style={styles.regionCardContainer}
    >
      <Animated.View
        style={[
          styles.regionCard,
          isSelected ? styles.regionCardSelected : styles.regionCardUnselected,
          isAllRegions && !isSelected && styles.regionCardAll,
          { transform: [{ scale }] },
        ]}
      >
        {isAllRegions ? (
          <View style={[styles.flagCircle, isSelected && styles.flagCircleSelected]}>
            <Ionicons name="globe-outline" size={24} color={isSelected ? '#FFFFFF' : '#4648D4'} />
          </View>
        ) : (
          <View style={[styles.flagCircle, isSelected && styles.flagCircleSelected]}>
            {flagImage && (
              <Image source={flagImage} style={styles.flagImage} />
            )}
          </View>
        )}
        <Text style={[styles.regionName, isSelected && styles.regionNameSelected]}>{name}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function LocationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('in');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const gpsScale = useRef(new Animated.Value(1)).current;
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

  const handleGpsPressIn = () => {
    Animated.spring(gpsScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleGpsPressOut = () => {
    Animated.spring(gpsScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleContinue = () => {
    router.push('/(onboarding)/interests');
  };

  const handleUseCurrentLocation = () => {
    // Simulate finding current location
    setSelectedRegion('in');
    setSearchQuery('Hyderabad, India');
  };

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(regionId);
    const region = POPULAR_REGIONS.find(r => r.id === regionId);
    if (region && !region.isAllRegions) {
      setSearchQuery(region.name);
    } else if (region?.isAllRegions) {
      setSearchQuery('Global');
    }
  };

  // Interpolate search border colors
  const searchBorderColor = searchBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(199, 196, 215, 0.5)', '#4648D4'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Simulated Background Blur Vectors */}
      <View style={styles.purpleBlur} />
      <View style={styles.tealBlur} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0B1C30" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>HyperLocal</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Titles */}
        <View style={styles.headlineSection}>
          <Text style={styles.mainTitle}>Where are you?</Text>
          <Text style={styles.subtitle}>
            Get news and updates tailored to your region.
          </Text>
        </View>

        {/* Search Bar & GPS Button */}
        <View style={styles.searchContainer}>
          <Animated.View
            style={[
              styles.searchBar,
              {
                borderColor: searchBorderColor,
                shadowOpacity: isSearchFocused ? 0.15 : 0.05,
              }
            ]}
          >
            <Ionicons name="search-outline" size={20} color="#767586" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city or country"
              placeholderTextColor="#767586"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </Animated.View>

          {/* GPS Button */}
          <Pressable
            onPress={handleUseCurrentLocation}
            onPressIn={handleGpsPressIn}
            onPressOut={handleGpsPressOut}
          >
            <Animated.View style={[styles.gpsButton, { transform: [{ scale: gpsScale }] }]}>
              <Ionicons name="locate-outline" size={20} color="#4648D4" />
              <Text style={styles.gpsButtonText}>Use current location</Text>
            </Animated.View>
          </Pressable>
        </View>

        {/* Popular Regions Bento Grid Section */}
        <View style={styles.popularSection}>
          <Text style={styles.sectionHeader}>POPULAR REGIONS</Text>

          <View style={styles.gridContainer}>
            {POPULAR_REGIONS.map((region) => (
              <RegionCard
                key={region.id}
                name={region.name}
                flagImage={region.flagImage}
                isAllRegions={region.isAllRegions}
                isSelected={selectedRegion === region.id}
                onPress={() => handleSelectRegion(region.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Footer Action */}
      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={styles.continueButton}
            onPress={handleContinue}
            onPressIn={handleContinuePressIn}
            onPressOut={handleContinuePressOut}
          >
            <Text style={styles.continueButtonText}>Get Started</Text>
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
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.64,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#464554',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  searchContainer: {
    gap: 16,
    marginBottom: 40,
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
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(70, 72, 212, 0.08)',
    height: 56,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(70, 72, 212, 0.15)',
  },
  gpsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4648D4',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.4,
  },
  popularSection: {
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
  regionCardContainer: {
    width: '47.5%',
    height: 120,
  },
  regionCard: {
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
  regionCardSelected: {
    backgroundColor: '#E6E7FB',
    borderColor: '#4648D4',
    borderStyle: 'solid',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  regionCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderStyle: 'solid',
  },
  regionCardAll: {
    backgroundColor: '#F4F5FC',
    borderColor: 'rgba(199, 196, 215, 0.5)',
    borderStyle: 'dashed',
  },
  flagCircle: {
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
  flagCircleSelected: {
    borderColor: '#4648D4',
    backgroundColor: '#E1E0FF',
    shadowOpacity: 0.15,
  },
  flagImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  regionName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0B1C30',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  regionNameSelected: {
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
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 28,
  },
});