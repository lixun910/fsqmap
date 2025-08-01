import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Chain {
  id: string;
  name?: string;
}

interface SocialMedia {
  facebook_id?: string;
  twitter?: string;
}

interface RelatedPlaces {
  parent?: {
    fsq_place_id: string;
    categories: Category[];
    name: string;
  };
}

interface Place {
  id: string;
  name: string;
  location: Location;
  categories: Category[];
  chains?: Chain[];
  distance: number;
  phone?: string;
  website?: string;
  socialMedia?: SocialMedia;
  dateCreated: string;
  dateRefreshed: string;
  extendedLocation?: {
    dma: string;
    census_block_id: string;
  };
  link: string;
  placemakerUrl: string;
  relatedPlaces: RelatedPlaces;
}

interface PlacesData {
  type: string;
  content: Place[];
  metadata: {
    totalResults: number;
    searchQuery: string;
    location: {
      longitude: number;
      latitude: number;
    };
    sort: string;
  };
}

interface PlacesResultProps {
  data: any; // Allow flexible data structure
  onPlaceSelect?: (place: Place) => void;
}

export function PlacesResult({ data, onPlaceSelect }: PlacesResultProps) {
  // Debug: Log the data structure
  console.log('PlacesResult data:', JSON.stringify(data, null, 2));
  
  const {
    location: userLocation,
    isLoading: locationLoading,
    errorMsg: locationError,
    getCurrentLocation,
  } = useLocation();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const mapViewRef = useRef<MapView>(null);

  // Try to get location if not available
  React.useEffect(() => {
    if (!userLocation && !locationLoading && !locationError) {
      getCurrentLocation();
    }
  }, [userLocation, locationLoading, locationError]);

  // Auto-select first place by default
  React.useEffect(() => {
    if (data && data.content && data.content.length > 0 && !selectedPlaceId) {
      const firstPlace = data.content[0];
      setSelectedPlaceId(firstPlace.id);
      
      // Notify parent component about the selection
      onPlaceSelect?.(firstPlace);
      
      // Animate map to selected place
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude: firstPlace.location.latitude,
            longitude: firstPlace.location.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          },
          1000
        );
      }
    }
  }, [data, selectedPlaceId]);

  const renderLoadingAnimation = () => {
    return (
      <View
        style={{
          padding: 20,
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text
          style={{
            marginTop: 12,
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
          }}
        >
          Searching for places...
        </Text>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 8,
            gap: 4,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#007AFF',
              opacity: 0.6,
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#007AFF',
              opacity: 0.8,
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#007AFF',
              opacity: 1,
            }}
          />
        </View>
      </View>
    );
  };

  if (!data) {
    return renderLoadingAnimation();
  }

  // Handle different data structures
  let places: Place[] = [];
  let metadata: any = {};

  // Try multiple possible data structures
  if (data.content && Array.isArray(data.content)) {
    // Direct structure: { content: [...], metadata: {...} }
    places = data.content;
    metadata = data.metadata || {};
  } else if (data.type === 'places' && data.content && Array.isArray(data.content)) {
    // Places structure: { type: 'places', content: [...], metadata: {...} }
    places = data.content;
    metadata = data.metadata || {};
  } else if (data.placeSearch && data.placeSearch.content && Array.isArray(data.placeSearch.content)) {
    // Nested structure: { placeSearch: { content: [...], metadata: {...} } }
    places = data.placeSearch.content;
    metadata = data.placeSearch.metadata || {};
  } else {
    // Try to find places data in any nested object
    const keys = Object.keys(data);
    for (const key of keys) {
      if (data[key] && typeof data[key] === 'object' && data[key].content && Array.isArray(data[key].content)) {
        places = data[key].content;
        metadata = data[key].metadata || {};
        break;
      }
    }
  }

  console.log('Extracted places:', places.length, 'metadata:', metadata);

  if (places.length === 0) {
    return renderLoadingAnimation();
  }

  // Calculate map region to fit all places or focus on selected place
  const calculateMapRegion = () => {
    if (places.length === 0) return null;

    if (selectedPlaceId) {
      // Focus on selected place
      const selectedPlace = places.find((p: Place) => p.id === selectedPlaceId);
      if (selectedPlace) {
        return {
          latitude: selectedPlace.location.latitude,
          longitude: selectedPlace.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
      }
    }

    // Show all places
    const latitudes = places.map((p: Place) => p.location.latitude);
    const longitudes = places.map((p: Place) => p.location.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = (maxLat - minLat) * 1.2; // Add 20% padding
    const lngDelta = (maxLng - minLng) * 1.2;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.min(latDelta, 0.001),
      longitudeDelta: Math.min(lngDelta, 0.001),
    };
  };

  const handlePlacePress = (placeId: string) => {
    setSelectedPlaceId(placeId);

    // Find the selected place
    const selectedPlace = places.find((p: Place) => p.id === placeId);
    
    if (selectedPlace) {
      // Notify parent component about the selection
      onPlaceSelect?.(selectedPlace);
      
      // Animate map to selected place
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude: selectedPlace.location.latitude,
            longitude: selectedPlace.location.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          },
          1000
        );
      }
    }
  };

  const handleMarkerPress = (placeId: string) => {
    setSelectedPlaceId(placeId);
    // Scroll to the corresponding place view
    const placeIndex = places.findIndex((p: Place) => p.id === placeId);
    if (placeIndex !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: placeIndex * 292, // 280 (width) + 12 (marginRight)
        animated: true,
      });
    }
  };

  const mapRegion = calculateMapRegion();

  return (
    <View style={{ marginVertical: 8 }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#007AFF',
          padding: 12,
          borderRadius: 8,
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 4,
          }}
        >
          🍽️ Places Found
        </Text>
        <Text style={{ color: 'white', fontSize: 12, opacity: 0.9 }}>
          Found {metadata.totalResults} places for "{metadata.searchQuery}"
        </Text>
        <Text style={{ color: 'white', fontSize: 10, opacity: 0.8 }}>
          Sorted by {metadata.sort}
        </Text>
      </View>

      {/* Map showing all places */}
      {places.length > 0 && mapRegion && (
        <View
          style={{
            height: 200,
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <MapView
            ref={mapViewRef}
            style={{ flex: 1 }}
            initialRegion={mapRegion}
          >
            {/* Show all markers */}
            {places.map((place: Place) => {
              return (
                <Marker
                  key={`${place.id}-unselected-only`}
                  coordinate={{
                    latitude: place.location.latitude,
                    longitude: place.location.longitude,
                  }}
                  title={place.name}
                  description={place.location.address}
                  pinColor="red"
                  onPress={() => handleMarkerPress(place.id)}
                  tracksViewChanges={false}
                  opacity={1}
                  zIndex={999}
                />
              );
            })}

            {/* Show selected marker in green */}
            {places
              .filter((place: Place) => selectedPlaceId === place.id)
              .map((place: Place) => {
                return (
                  <Marker
                    key={`${place.id}-selected-only`}
                    coordinate={{
                      latitude: place.location.latitude,
                      longitude: place.location.longitude,
                    }}
                    title={place.name}
                    description={place.location.address}
                    pinColor="green"
                    onPress={() => handleMarkerPress(place.id)}
                    tracksViewChanges={false}
                    opacity={1}
                    zIndex={999}
                  />
                );
              })}

            {/* Show user's location in blue */}
            <Marker
              coordinate={{
                latitude: userLocation?.latitude ?? metadata.location.latitude,
                longitude: userLocation?.longitude ?? metadata.location.longitude,
              }}
              title="Your Location"
              description="You are here"
              pinColor="blue"
              opacity={0.2}
            />
          </MapView>
        </View>
      )}

      {/* Places */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {places.map((place: Place, index: number) => (
          <TouchableOpacity
            key={place.id}
            onPress={() => handlePlacePress(place.id)}
            activeOpacity={0.8}
          >
            <View
              style={{
                backgroundColor:
                  selectedPlaceId === place.id ? '#e3f2fd' : 'white',
                borderRadius: 12,
                padding: 16,
                marginRight: 12,
                width: Dimensions.get('window').width * 0.8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                borderWidth: selectedPlaceId === place.id ? 2 : 0,
                borderColor: '#007AFF',
              }}
            >
              {/* Place Name */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  marginBottom: 8,
                }}
              >
                {place.name}
              </Text>

              {/* Distance */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: '#007AFF',
                    backgroundColor: '#e3f2fd',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                    fontWeight: '500',
                  }}
                >
                  📏 {place.distance}m away
                </Text>
              </View>

              {/* Address */}
              <Text
                style={{
                  fontSize: 14,
                  color: '#666',
                  marginBottom: 8,
                  lineHeight: 20,
                }}
              >
                📍 {place.location.address}
              </Text>

              {/* Categories */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginBottom: 12,
                }}
              >
                {place.categories.map((category) => (
                  <View
                    key={category.id}
                    style={{
                      backgroundColor: '#f8f9fa',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      marginRight: 6,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#495057' }}>
                      {category.name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Contact Actions */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {place.phone && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#28a745',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      flex: 1,
                    }}
                    onPress={() => Linking.openURL(`tel:${place.phone}`)}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 12,
                        textAlign: 'center',
                      }}
                    >
                      📞 Call
                    </Text>
                  </TouchableOpacity>
                )}

                {place.website && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#007AFF',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      flex: 1,
                    }}
                    onPress={() =>
                      place.website && Linking.openURL(place.website)
                    }
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 12,
                        textAlign: 'center',
                      }}
                    >
                      🌐 Website
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Additional Info */}
              {(place.socialMedia || place.relatedPlaces?.parent) && (
                <View
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#e9ecef',
                  }}
                >
                  {place.socialMedia?.twitter && (
                    <Text style={{ fontSize: 12, color: '#6c757d' }}>
                      🐦 @{place.socialMedia.twitter}
                    </Text>
                  )}
                  {place.relatedPlaces?.parent && (
                    <Text style={{ fontSize: 12, color: '#6c757d' }}>
                      🏢 Part of: {place.relatedPlaces.parent.name}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
} 