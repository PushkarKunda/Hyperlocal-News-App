import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTimeAgo } from '@/utils/formatters';


export function NewsCard({ item, containerHeight }: any) {

    const imageUrl = item.imageUrl;
    const headline = item.headline || 'No Title Available';
    const source = item.source?.name || 'NewsWire Global';
    const timestamp = formatTimeAgo(item.publishedAt);
    const content = item.summary || item.content || 'Summary unavailable.';
    const category = item.category?.name || 'TECHNOLOGY';

    const truncateHeadline = (text: string) => {
        if (!text) return '';
        if (text.length > 85) return text.substring(0, 82) + '...';
        return text;
    };

    const handleShare = async () => {
        try {
            const shareUrl = item.url || 'https://hyperlocal.app';
            await Share.share({
                message: `Check out this article: ${headline}\n\n${content}\n\nRead more here: ${shareUrl}\n\nShared via HyperLocal News App.`,
                url: shareUrl,
                title: headline,
            });
        } catch (error) {
            // share dismissed or failed silently
        }
    };

    const ActionButton = ({ iconName, count, label, onPress }: any) => (
        <View style={styles.actionButtonContainer}>
            <TouchableOpacity style={styles.actionRound} activeOpacity={0.7} onPress={onPress}>
                <Ionicons name={iconName} size={26} color="#013432" />
            </TouchableOpacity>
            {count && <Text style={styles.actionText}>{count}</Text>}
            {label && <Text style={styles.actionText}>{label}</Text>}
        </View>
    );

    return (
        <View style={[styles.cardContainer, { height: containerHeight }]}>
            {/* Top 42% Image */}
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

            {/* Content Overlay / Bottom Half */}
            <View style={styles.contentContainer}>

                {/* Floating Action Column */}
                <View style={styles.floatingActions}>
                    <ActionButton iconName="heart-outline" count={item.stats?.likes > 1000 ? '1.2k' : item.stats?.likes || '1.2k'} />
                    <ActionButton iconName="share-social-outline" count={item.stats?.shares || '450'} onPress={handleShare} />
                    <ActionButton iconName="bookmark-outline" label="Save" />
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
                </View>

                {/* Swipe Indicator */}
                <View style={styles.swipeIndicatorRow}>
                    <Text style={styles.swipeText}>SWIPE UP FOR NEXT</Text>
                    <Ionicons name="chevron-up" size={14} color="#A0AEC0" />
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
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
        paddingRight: 40,
        fontFamily: 'Poppins_700Bold', // Preserve our fancy font
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
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 1,
        backgroundColor: 'transparent',
    },
    actionText: {
        fontSize: 12,
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
});
