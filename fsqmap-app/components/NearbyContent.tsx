import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  imageUrl: string;
  discount: string;
}

interface Short {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  channel: string;
}

interface NearbyContentProps {
  deals: Deal[];
  shorts: Short[];
  onDealPress: (deal: Deal) => void;
  onShortPress: (short: Short) => void;
}

export function NearbyContent({ deals, shorts, onDealPress, onShortPress }: NearbyContentProps) {
  return (
    <View style={styles.container}>
      {/* Nearby Deals Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby Deals</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {deals.map((deal) => (
            <TouchableOpacity
              key={deal.id}
              style={styles.dealCard}
              onPress={() => onDealPress(deal)}
            >
              <View style={styles.dealImageContainer}>
                <Image source={{ uri: deal.imageUrl }} style={styles.dealImage} />
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{deal.discount}</Text>
                </View>
              </View>
              <View style={styles.dealContent}>
                <Text style={styles.dealTitle} numberOfLines={2}>
                  {deal.title}
                </Text>
                <Text style={styles.dealDescription} numberOfLines={1}>
                  {deal.description}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>{deal.originalPrice}</Text>
                  <Text style={styles.discountedPrice}>{deal.discountedPrice}</Text>
                </View>
                <TouchableOpacity style={styles.useDealButton}>
                  <Text style={styles.useDealButtonText}>Use Deal</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Nearby Shorts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby Shorts</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {shorts.map((short) => (
            <TouchableOpacity
              key={short.id}
              style={styles.shortCard}
              onPress={() => onShortPress(short)}
            >
              <View style={styles.shortImageContainer}>
                <Image source={{ uri: short.thumbnail }} style={styles.shortImage} />
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{short.duration}</Text>
                </View>
              </View>
              <View style={styles.shortContent}>
                <Text style={styles.shortTitle} numberOfLines={2}>
                  {short.title}
                </Text>
                <Text style={styles.shortChannel}>{short.channel}</Text>
                <Text style={styles.shortViews}>{short.views} views</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  dealCard: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealImageContainer: {
    position: 'relative',
  },
  dealImage: {
    width: '100%',
    height: 96,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dealContent: {
    padding: 12,
  },
  dealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dealDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff4757',
  },
  useDealButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  useDealButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  shortCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shortImageContainer: {
    position: 'relative',
  },
  shortImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: 'white',
    fontSize: 12,
    marginLeft: 2,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  shortContent: {
    padding: 12,
  },
  shortTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  shortChannel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  shortViews: {
    fontSize: 11,
    color: '#999',
  },
}); 