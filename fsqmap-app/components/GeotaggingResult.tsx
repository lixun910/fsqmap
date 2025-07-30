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

interface GeotaggingCandidate {
  id: string;
  name: string;
  location: Location;
  categories: Category[];
  chains: Chain[];
  distance: number;
  phone?: string;
  website?: string;
  email?: string;
  socialMedia?: SocialMedia;
}

interface GeotaggingData {
  type: string;
  content: GeotaggingCandidate[];
  metadata: {
    totalResults: number;
    location: string;
  };
}

interface GeotaggingResultProps {
  data: any;
}

export function GeotaggingResult({ data }: GeotaggingResultProps) {
  const {
    location: userLocation,
    isLoading: locationLoading,
    errorMsg: locationError,
    getCurrentLocation,
  } = useLocation();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const mapViewRef = useRef<MapView>(null);

  // Try to get location if not available
  React.useEffect(() => {
    if (!userLocation && !locationLoading && !locationError) {
      getCurrentLocation();
    }
  }, [userLocation, locationLoading, locationError]);

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
          Searching for nearby places...
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

  if (!data || !data.datasetName) {
    return renderLoadingAnimation();
  }

  const datasetName = data.datasetName;
  const { content: candidates, metadata, type } = data[datasetName];

  // Calculate map region to fit all candidates or focus on selected candidate
  const calculateMapRegion = () => {
    if (candidates.length === 0) return null;

    if (selectedCandidateId) {
      // Focus on selected candidate
      const selectedCandidate = candidates.find(
        (c: GeotaggingCandidate) => c.id === selectedCandidateId
      );
      if (selectedCandidate) {
        return {
          latitude: selectedCandidate.location.latitude,
          longitude: selectedCandidate.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
      }
    }

    // Show all candidates
    const latitudes = candidates.map(
      (c: GeotaggingCandidate) => c.location.latitude
    );
    const longitudes = candidates.map(
      (c: GeotaggingCandidate) => c.location.longitude
    );

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

  const handleCandidatePress = (candidateId: string) => {
    setSelectedCandidateId(candidateId);

    // Animate map to selected candidate
    const selectedCandidate = candidates.find(
      (c: GeotaggingCandidate) => c.id === candidateId
    );
    if (selectedCandidate && mapViewRef.current) {
      mapViewRef.current.animateToRegion(
        {
          latitude: selectedCandidate.location.latitude,
          longitude: selectedCandidate.location.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        },
        1000
      );
    }
  };

  const handleMarkerPress = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    // Scroll to the corresponding candidate view
    const candidateIndex = candidates.findIndex(
      (c: GeotaggingCandidate) => c.id === candidateId
    );
    if (candidateIndex !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: candidateIndex * 292, // 280 (width) + 12 (marginRight)
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
          📍 Nearby Places
        </Text>
        <Text style={{ color: 'white', fontSize: 12, opacity: 0.9 }}>
          Found {metadata.totalResults} places near your location
        </Text>
      </View>

      {/* Map showing all candidates */}
      {candidates.length > 0 && mapRegion && (
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
            {/* show all marker */}
            {candidates.map((candidate: GeotaggingCandidate) => {
              return (
                <Marker
                  key={`${candidate.id}-unselected-only`}
                  coordinate={{
                    latitude: candidate.location.latitude,
                    longitude: candidate.location.longitude,
                  }}
                  title={candidate.name}
                  description={candidate.location.address}
                  pinColor="red"
                  onPress={() => handleMarkerPress(candidate.id)}
                  tracksViewChanges={false}
                  opacity={1}
                  zIndex={999}
                />
              );
            })}

            {/* show selected marker in green */}
            {candidates
              .filter(
                (candidate: GeotaggingCandidate) =>
                  selectedCandidateId === candidate.id
              )
              .map((candidate: GeotaggingCandidate) => {
                return (
                  <Marker
                    key={`${candidate.id}-selected-only`}
                    coordinate={{
                      latitude: candidate.location.latitude,
                      longitude: candidate.location.longitude,
                    }}
                    title={candidate.name}
                    description={candidate.location.address}
                    pinColor="green"
                    onPress={() => handleMarkerPress(candidate.id)}
                    tracksViewChanges={false}
                    opacity={1}
                    zIndex={999}
                  />
                );
              })}

            {/* show user's location in blue */}
            <Marker
              coordinate={{
                latitude: userLocation?.latitude ?? 37.785257886021306,
                longitude: userLocation?.longitude ?? -122.40610063076019,
              }}
              title="Your Location"
              description="You are here"
              pinColor="blue"
              opacity={0.2}
            />
          </MapView>
        </View>
      )}

      {/* Candidates */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {candidates.map((candidate: GeotaggingCandidate, index: number) => (
          <TouchableOpacity
            key={candidate.id}
            onPress={() => handleCandidatePress(candidate.id)}
            activeOpacity={0.8}
          >
            <View
              style={{
                backgroundColor:
                  selectedCandidateId === candidate.id ? '#e3f2fd' : 'white',
                borderRadius: 12,
                padding: 16,
                marginRight: 12,
                width: Dimensions.get('window').width * 0.8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                borderWidth: selectedCandidateId === candidate.id ? 2 : 0,
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
                {candidate.name}
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
                  📏 {candidate.distance}m away
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
                📍 {candidate.location.address}
              </Text>

              {/* Categories */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginBottom: 12,
                }}
              >
                {candidate.categories.map((category) => (
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
                {candidate.phone && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#28a745',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      flex: 1,
                    }}
                    onPress={() => Linking.openURL(`tel:${candidate.phone}`)}
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

                {candidate.website && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#007AFF',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      flex: 1,
                    }}
                    onPress={() =>
                      candidate.website && Linking.openURL(candidate.website)
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
              {(candidate.email || candidate.socialMedia) && (
                <View
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#e9ecef',
                  }}
                >
                  {candidate.email && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#6c757d',
                        marginBottom: 2,
                      }}
                    >
                      📧 {candidate.email}
                    </Text>
                  )}
                  {candidate.socialMedia?.twitter && (
                    <Text style={{ fontSize: 12, color: '#6c757d' }}>
                      🐦 @{candidate.socialMedia.twitter}
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