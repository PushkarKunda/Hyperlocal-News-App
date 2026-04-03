import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function NewsCard({ item, containerHeight }) {
    const [modalVisible, setModalVisible] = useState(false);

    // Map API fields, providing fallbacks for missing data
    const imageUrl = item.image_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
    const headline = item.title || 'No Title Available';
    const source = item.source_id || 'NewsWire Global';
    const timestamp = item.pubDate ? new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2h ago';
    const content = item.description || item.content || 'The city council has officially approved a landmark budget for sustainable high-tech transit systems. This initiative aims to reduce carbon emissions by 40%.';
    const category = (item.category && item.category[0]) || 'TECHNOLOGY';

    const truncateHeadline = (text) => {
        if (!text) return '';
        if (text.length > 85) return text.substring(0, 82) + '...';
        return text;
    };

    const ActionButton = ({ icon, count, label }) => (
        <View style={styles.actionButtonContainer}>
            <TouchableOpacity style={styles.actionRound}>
                <Ionicons name={icon} size={22} color="#013432" />
            </TouchableOpacity>
            {count && <Text style={styles.actionText}>{count}</Text>}
            {label && <Text style={styles.actionText}>{label}</Text>}
        </View>
    );

    return (
        <View style={[styles.cardContainer, { height: containerHeight }]}>
            {/* Top 40% Image */}
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

            {/* Content Overlay / Bottom Half */}
            <View style={styles.contentContainer}>

                {/* Floating Action Column */}
                <View style={styles.floatingActions}>
                    <ActionButton icon="heart" count="1.2k" />
                    <ActionButton icon="share-social" count="450" />
                    <ActionButton icon="bookmark" label="Save" />
                </View>

                {/* Top Meta Info (Category + Timestamp) */}
                <View style={styles.metaRow}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{String(category).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.timestamp}>{timestamp}</Text>
                </View>

                {/* Headline */}
                <Text style={styles.headline} numberOfLines={3}>{truncateHeadline(headline)}</Text>

                {/* Body Snippet */}
                <Text style={styles.contentSnippet} numberOfLines={5}>{content}</Text>

                <View style={styles.spacer} />

                {/* Footer Meta Row */}
                <View style={styles.footerRow}>
                    <Text style={styles.sourcePrefix}>
                        source: <Text style={styles.sourceName}>{source}</Text>
                    </Text>
                    <TouchableOpacity style={styles.readMoreBtn} onPress={() => setModalVisible(true)}>
                        <Text style={styles.readMoreText}>Read more</Text>
                        <Ionicons name="chevron-forward" size={14} color="#5A5AF5" />
                    </TouchableOpacity>
                </View>

                {/* Swipe Indicator */}
                <View style={styles.swipeIndicatorRow}>
                    <Text style={styles.swipeText}>SWIPE UP FOR NEXT</Text>
                    <Ionicons name="chevron-up" size={14} color="#A0AEC0" />
                </View>
            </View>

            {/* Detailed View Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <Image source={{ uri: imageUrl }} style={styles.modalImage} resizeMode="cover" />
                        <Text style={styles.modalSource}>{source} • {timestamp}</Text>
                        <Text style={styles.modalHeadline}>{headline}</Text>
                        <Text style={styles.modalContent}>{content}</Text>

                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: screenWidth,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: '42%',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 15,
        position: 'relative',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    tag: {
        backgroundColor: '#F0F0FF',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    tagText: {
        color: '#5A5AF5',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    timestamp: {
        marginLeft: 12,
        fontSize: 14,
        color: '#718096',
        fontWeight: '500',
    },
    headline: {
        fontSize: 26,
        fontWeight: '900',
        color: '#1A202C',
        lineHeight: 34,
        marginBottom: 16,
        paddingRight: 40, // leave space for floating buttons
    },
    contentSnippet: {
        fontSize: 17,
        color: '#4A5568',
        lineHeight: 26,
        paddingRight: 40,
    },
    floatingActions: {
        position: 'absolute',
        right: 20,
        top: 90,
        zIndex: 10,
        alignItems: 'center',
    },
    actionButtonContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    actionRound: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 4,
    },
    actionText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4A5568',
    },
    spacer: {
        flex: 1,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    sourcePrefix: {
        fontSize: 14,
        color: '#A0AEC0',
        fontWeight: '500',
    },
    sourceName: {
        color: '#1A202C',
        fontWeight: '800',
    },
    readMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readMoreText: {
        color: '#5A5AF5',
        fontWeight: '700',
        fontSize: 15,
        marginRight: 2,
    },
    swipeIndicatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    swipeText: {
        fontSize: 10,
        color: '#A0AEC0',
        fontWeight: '700',
        letterSpacing: 1,
        marginRight: 6,
    },
    // Modal styles untouched mostly...
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalScroll: { paddingBottom: 40 },
    modalImage: { width: '100%', height: 300 },
    modalSource: { fontSize: 14, color: '#666', marginTop: 20, marginHorizontal: 20, fontWeight: '600' },
    modalHeadline: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginHorizontal: 20, marginTop: 10, marginBottom: 20, lineHeight: 32 },
    modalContent: { fontSize: 16, color: '#333', lineHeight: 24, marginHorizontal: 20, marginBottom: 30 },
    closeButton: { backgroundColor: '#e5e5ea', paddingVertical: 12, marginHorizontal: 20, borderRadius: 8, alignItems: 'center' },
    closeButtonText: { color: '#000', fontSize: 16, fontWeight: '600' },
});
