import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  TextInput,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  DimensionValue,
} from 'react-native';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useStatesList } from '@/hooks/useApi';

interface StateCardProps {
  name: string;
  code: string;
  isSelected: boolean;
  onPress: () => void;
  width?: DimensionValue;
  marginRight?: DimensionValue;
  marginBottom?: DimensionValue;
}

function StateCard({ name, code, isSelected, onPress, width, marginRight, marginBottom }: StateCardProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.regionCardContainer, { width, marginRight, marginBottom }]}
    >
      <Animated.View
        style={[
          styles.regionCard,
          isSelected ? styles.regionCardSelected : styles.regionCardUnselected,
          {
            backgroundColor: isSelected
              ? isDark ? '#2A2A4D' : '#E6E7FB'
              : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
          { transform: [{ scale }] },
        ]}
      >
        {/* Selection Badge */}
        {isSelected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          </View>
        )}
        <View
          style={[
            styles.flagCircle,
            {
              backgroundColor: isSelected ? colors.primary : isDark ? '#2A2A3C' : '#F1F5F9',
              borderColor: isSelected ? colors.primary : colors.border,
            },
          ]}
        >
          <Text style={[styles.stateCodeText, { color: isSelected ? '#FFFFFF' : colors.primary }]}>
            {code}
          </Text>
        </View>
        <Text
          style={[
            styles.regionName,
            { color: isSelected ? colors.primary : colors.text },
            isSelected && styles.regionNameSelected,
          ]}
          numberOfLines={2}
        >
          {name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function SettingsLocationScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: statesList = [], isLoading } = useStatesList();
  const { user } = useAuthStore();

  // Pre-select the user's currently saved state
  const currentStateId = statesList.find(s => s.name === user?.state)?.id ?? 'ts';
  const [selectedState, setSelectedState] = useState(currentStateId);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const saveScale = useRef(new Animated.Value(1)).current;
  const gpsScale = useRef(new Animated.Value(1)).current;
  const searchBorderAnim = useRef(new Animated.Value(0)).current;

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.timing(searchBorderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.timing(searchBorderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const handleSavePressIn = () => {
    Animated.spring(saveScale, { toValue: 0.95, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  const handleSavePressOut = () => {
    Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  const handleGpsPressIn = () => {
    Animated.spring(gpsScale, { toValue: 0.95, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  const handleGpsPressOut = () => {
    Animated.spring(gpsScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  const handleSave = () => {
    const matchedState = statesList.find(s => s.id === selectedState);
    if (matchedState) {
      useAuthStore.setState(prev => ({
        user: prev.user ? { ...prev.user, state: matchedState.name } : null,
      }));
    }
    router.replace('/(tabs)');
  };

  const handleUseCurrentLocation = async () => {
    if (isLocating) return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need location access to find your current state.');
        return;
      }
      setIsLocating(true);
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;
      const reverseGeocoded = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (reverseGeocoded && reverseGeocoded.length > 0) {
        const address = reverseGeocoded[0];
        const stateName = address.region || '';
        const cityName = address.city || address.subregion || address.district || '';

        const matchedState = statesList.find(s =>
          s.name.toLowerCase().includes(stateName.toLowerCase()) ||
          stateName.toLowerCase().includes(s.name.toLowerCase())
        );

        if (matchedState) {
          setSelectedState(matchedState.id);
          setSearchQuery(cityName ? `${cityName}, ${matchedState.name}` : matchedState.name);
        } else {
          setSelectedState('ts');
          setSearchQuery(cityName ? `${cityName}, ${stateName}` : 'Hyderabad, Telangana');
          Alert.alert(
            'Location Detected',
            `Detected: ${stateName || 'Unknown region'}. Defaulting to Telangana.`
          );
        }
      } else {
        setSelectedState('ts');
        setSearchQuery('Hyderabad, Telangana');
      }
    } catch (error) {
      Alert.alert('Location Error', 'Could not fetch your location. Please select manually.');
      setSelectedState('ts');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectState = (stateId: string) => {
    setSelectedState(stateId);
    const state = statesList.find(s => s.id === stateId);
    if (state) setSearchQuery(state.name);
  };

  const filteredStates = statesList.filter(state =>
    state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    state.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchBorderColor = searchBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Background Blurs */}
      <View style={[styles.purpleBlur, { backgroundColor: colorScheme === 'dark' ? 'rgba(70, 72, 212, 0.12)' : 'rgba(70, 72, 212, 0.04)' }]} />
      <View style={[styles.tealBlur, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 106, 97, 0.12)' : 'rgba(0, 106, 97, 0.04)' }]} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.headerLeftButton, { backgroundColor: 'rgba(70, 72, 212, 0.05)' }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Location</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleSection}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select your state to get region-specific news
        </Text>
      </View>

      {/* Search + GPS */}
      <View style={styles.searchWrapper}>
        <Animated.View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: searchBorderColor,
              shadowOpacity: isSearchFocused ? 0.15 : 0.05,
            },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search state..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* GPS Button */}
        <Pressable
          onPress={handleUseCurrentLocation}
          onPressIn={handleGpsPressIn}
          onPressOut={handleGpsPressOut}
          disabled={isLocating}
        >
          <Animated.View
            style={[
              styles.gpsButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                transform: [{ scale: gpsScale }],
              },
              isLocating && { opacity: 0.6 },
            ]}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="locate-outline" size={20} color={colors.primary} />
            )}
            <Text style={[styles.gpsButtonText, { color: colors.primary }]}>
              {isLocating ? 'Locating...' : 'Use current location'}
            </Text>
          </Animated.View>
        </Pressable>
      </View>

      {/* State Grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>INDIAN STATES</Text>
        <View style={styles.gridContainer}>
          {(() => {
            let singleCount = 0;
            return filteredStates.map((state) => {
              const marginRight = singleCount++ % 2 === 0 ? '6%' : '0%';
              return (
                <StateCard
                  key={state.id}
                  name={state.name}
                  code={state.code}
                  isSelected={selectedState === state.id}
                  onPress={() => handleSelectState(state.id)}
                  width="47%"
                  marginRight={marginRight}
                  marginBottom={16}
                />
              );
            });
          })()}
          {filteredStates.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No states found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        <Animated.View style={{ transform: [{ scale: saveScale }] }}>
          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
            onPressIn={handleSavePressIn}
            onPressOut={handleSavePressOut}
          >
            <Ionicons name="checkmark" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  purpleBlur: {
    position: 'absolute',
    right: -39,
    top: -98,
    width: 156,
    height: 393.59,
    borderRadius: 9999,
    zIndex: -1,
  },
  tealBlur: {
    position: 'absolute',
    left: -19.5,
    bottom: -49.19,
    width: 117,
    height: 295.19,
    borderRadius: 9999,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 64,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerLeftButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  subtitleSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    marginBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1.5,
  },
  gpsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  regionCardContainer: {
    width: '47.5%',
    height: 120,
  },
  regionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  regionCardSelected: {
    borderColor: '#4648D4',
    shadowOpacity: 0.15,
    elevation: 3,
  },
  regionCardUnselected: {
    borderColor: 'rgba(199, 196, 215, 0.3)',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  flagCircle: {
    width: 48,
    height: 48,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 2,
  },
  stateCodeText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    textTransform: 'uppercase',
  },
  regionName: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  regionNameSelected: {
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
    width: '100%',
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  saveButton: {
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
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});
