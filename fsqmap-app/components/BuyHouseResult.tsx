import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import MapView, { Marker, Polygon, Callout, Circle } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { BuyHousePlace, BuyHousePolygon, BuyHouseResultProps } from '../types/BuyHouse';

// Constants
const MAP_ANIMATION_DURATION = 1000;
const DEFAULT_ZOOM_DELTA = 0.001;
const MAP_PADDING_FACTOR = 1.2;
const MAX_ZOOM_DELTA = 0.01;
const MIN_ZOOM_DELTA = 0.01; // Minimum zoom to ensure markers are visible

// Styles
const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  loadingContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  noPlacesContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPlacesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noPlacesSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  houseDescriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  houseDescriptionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  houseIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
    width: 24,
    height: 24,
  },
  houseDescriptionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  redfinLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginTop: 8,
    fontSize: 12,
  },
  categorySelectorContainer: {
    marginBottom: 12,
  },
  categorySelectorScrollView: {
    paddingHorizontal: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonSelected: {
    // Background and border colors are now applied dynamically
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    // Text color is now applied dynamically
  },
  categoryCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  categoryCountSelected: {
    // Text color is now applied dynamically
  },
});

// Utility functions
const isValidCoordinate = (coord: number): boolean => {
  return typeof coord === 'number' && !isNaN(coord);
};

const isValidGeometry = (geometry: any): boolean => {
  return (
    geometry &&
    geometry.coordinates &&
    Array.isArray(geometry.coordinates) &&
    geometry.coordinates.length >= 1
  );
};

const extractCoordinates = (feature: any): { latitude: number; longitude: number } | null => {
  const { geometry, properties } = feature;

  // Try geometry coordinates first
  if (isValidGeometry(geometry)) {
    if (geometry.type === 'Point') {
      const [longitude, latitude] = geometry.coordinates;
      if (isValidCoordinate(longitude) && isValidCoordinate(latitude)) {
        return { latitude, longitude };
      }
    }
  }

  // Fallback to properties coordinates
  if (properties.latitude && properties.longitude) {
    const { latitude, longitude } = properties;
    if (isValidCoordinate(longitude) && isValidCoordinate(latitude)) {
      return { latitude, longitude };
    }
  }

  return null;
};

const convertGeoJSONFeatureToPlace = (feature: any): BuyHousePlace | null => {
  const { properties } = feature;
  const coordinates = extractCoordinates(feature);

  if (!coordinates) {
    console.log('convertGeoJSONFeatureToPlace: No coordinates found for feature', feature.id);
    return null;
  }

  return {
    id: properties.id || feature.id,
    name: properties.name,
    location: {
      ...coordinates,
      address: properties.address || '',
      city: properties.city || '',
      state: properties.state || '',
      country: properties.country || '',
      postalCode: properties.postalCode || '',
    },
    categories: properties.categories || [],
    distance: properties.distance || 0,
    phone: properties.phone,
    website: properties.website,
    category: properties.category,
    color: properties.color,
  };
};

const convertGeoJSONFeatureToPolygon = (feature: any): BuyHousePolygon | null => {
  const { properties, geometry } = feature;

  if (!isValidGeometry(geometry) || geometry.type !== 'Polygon' || geometry.coordinates.length === 0) {
    return null;
  }

  const exteriorRing = geometry.coordinates[0];
  if (
    !exteriorRing ||
    !Array.isArray(exteriorRing) ||
    exteriorRing.length < 3
  ) {
    return null;
  }

  return {
    id: feature.id,
    coordinates: exteriorRing,
    category: properties.category,
    color: properties.color,
    opacity: properties.opacity || 0.3,
  };
};

// Custom hook for buy house data processing
const useBuyHouseData = (features: any[] | undefined) => {
  return useMemo(() => {
    if (!features || features.length === 0) {
      console.log('useBuyHouseData: No features found');
      return { places: [], polygons: [] };
    }

    try {
      console.log('useBuyHouseData: Processing', features.length, 'features');
      
      const pointFeatures = features.filter(
        (feature: any) => feature.geometry?.type === 'Point'
      );

      const polygonFeatures = features.filter(
        (feature: any) => feature.geometry?.type === 'Polygon'
      );

      console.log('useBuyHouseData: Found', pointFeatures.length, 'points and', polygonFeatures.length, 'polygons');

      const places = pointFeatures
        .map(convertGeoJSONFeatureToPlace)
        .filter(Boolean) as BuyHousePlace[];

      const polygons = polygonFeatures
        .map(convertGeoJSONFeatureToPolygon)
        .filter(Boolean) as BuyHousePolygon[];

      console.log('useBuyHouseData: Converted to', places.length, 'places and', polygons.length, 'polygons');

      return { places, polygons };
    } catch (error) {
      console.error('Error processing buy house data:', error);
      return { places: [], polygons: [] };
    }
  }, [features]);
};

const calculateMapRegion = (
  places: BuyHousePlace[],
  selectedPlaceId: string | null,
  polygons: BuyHousePolygon[] = []
) => {
  if (places.length === 0 && polygons.length === 0) return null;

  const validPlaces = places.filter(
    (place) =>
      isValidCoordinate(place.location.latitude) &&
      isValidCoordinate(place.location.longitude)
  );

  const validPolygons = polygons.filter(
    (polygon) =>
      polygon.coordinates.length >= 3 &&
      polygon.coordinates.every(
        (coord) => isValidCoordinate(coord[1]) && isValidCoordinate(coord[0])
      )
  );

  if (validPlaces.length === 0 && validPolygons.length === 0) {
    return null;
  }

  console.log('calculateMapRegion: Found', validPlaces.length, 'valid places and', validPolygons.length, 'valid polygons');

  // If we have polygons, prioritize them for the map region
  if (validPolygons.length > 0) {
    const allLatitudes: number[] = [];
    const allLongitudes: number[] = [];

    // Add polygon coordinates first
    validPolygons.forEach((polygon) => {
      polygon.coordinates.forEach((coord) => {
        allLatitudes.push(coord[1]);
        allLongitudes.push(coord[0]);
      });
    });

    // Add place coordinates as well
    validPlaces.forEach((place) => {
      allLatitudes.push(place.location.latitude);
      allLongitudes.push(place.location.longitude);
    });

    const minLat = Math.min(...allLatitudes);
    const maxLat = Math.max(...allLatitudes);
    const minLng = Math.min(...allLongitudes);
    const maxLng = Math.max(...allLongitudes);

    // Use a smaller padding factor for polygons to show more detail
    const polygonPaddingFactor = 1.05;
    const latDelta = Math.max(
      Math.min(
        (maxLat - minLat) * polygonPaddingFactor,
        MAX_ZOOM_DELTA
      ),
      MIN_ZOOM_DELTA
    );
    const lngDelta = Math.max(
      Math.min(
        (maxLng - minLng) * polygonPaddingFactor,
        MAX_ZOOM_DELTA
      ),
      MIN_ZOOM_DELTA
    );

    console.log('calculateMapRegion: Polygon-based region:', {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    });

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }

  // Focus on selected place if no polygons and a place is selected
  if (selectedPlaceId && validPlaces.length > 0) {
    const selectedPlace = validPlaces.find(
      (place) => place.id === selectedPlaceId
    );
    if (selectedPlace) {
      return {
        latitude: selectedPlace.location.latitude,
        longitude: selectedPlace.location.longitude,
        latitudeDelta: DEFAULT_ZOOM_DELTA,
        longitudeDelta: DEFAULT_ZOOM_DELTA,
      };
    }
  }

  // Show all places only (if we have places)
  if (validPlaces.length > 0) {
    const latitudes = validPlaces.map((place) => place.location.latitude);
    const longitudes = validPlaces.map((place) => place.location.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = Math.max(
      Math.min(
        (maxLat - minLat) * MAP_PADDING_FACTOR,
        MAX_ZOOM_DELTA
      ),
      MIN_ZOOM_DELTA
    );
    const lngDelta = Math.max(
      Math.min(
        (maxLng - minLng) * MAP_PADDING_FACTOR,
        MAX_ZOOM_DELTA
      ),
      MIN_ZOOM_DELTA
    );

    console.log('calculateMapRegion: Places-only region:', {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    });

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }
  
  // If no places but we have polygons, use the first polygon as default
  if (validPolygons.length > 0) {
    const firstPolygon = validPolygons[0];
    const coordinates = firstPolygon.coordinates.map((coord) => ({
      latitude: coord[1],
      longitude: coord[0],
    }));
    
    const validCoordinates = coordinates.filter(
      (coord) =>
        isValidCoordinate(coord.latitude) &&
        isValidCoordinate(coord.longitude)
    );
    
    if (validCoordinates.length >= 3) {
      const latitudes = validCoordinates.map(coord => coord.latitude);
      const longitudes = validCoordinates.map(coord => coord.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const latDelta = Math.max(
        (maxLat - minLat) * 1.05,
        MIN_ZOOM_DELTA
      );
      const lngDelta = Math.max(
        (maxLng - minLng) * 1.05,
        MIN_ZOOM_DELTA
      );
      
      console.log('calculateMapRegion: Polygon-only region:', {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      });
      
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };
    }
  }
  
  return null;
};

// Loading component
const LoadingAnimation = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Analyzing property...</Text>
    <View style={styles.loadingDots}>
      <View style={[styles.loadingDot, { opacity: 0.6 }]} />
      <View style={[styles.loadingDot, { opacity: 0.8 }]} />
      <View style={[styles.loadingDot, { opacity: 1 }]} />
    </View>
  </View>
));

// No places component
const NoPlacesFound = React.memo(({ data }: { data: any }) => (
  <View style={styles.noPlacesContainer}>
    <Text style={styles.noPlacesText}>No amenities found</Text>
    <Text style={styles.noPlacesSubtext}>
      No nearby amenities found within the specified distances
    </Text>
  </View>
));

// House description component
const HouseDescription = React.memo(({ 
  redfinDescription, 
  redfinUrl,
  houseThumbnail
}: { 
  redfinDescription?: string; 
  redfinUrl?: string; 
  houseThumbnail?: string;
}) => {
  if (!redfinDescription) {
    return null;
  }

  const handleRedfinPress = () => {
    if (redfinUrl) {
      Linking.openURL(redfinUrl);
    }
  };

  // Check if houseThumbnail is valid (not empty and looks like base64)
  const isValidThumbnail = houseThumbnail && 
    houseThumbnail.trim() !== '' && 
    (houseThumbnail.startsWith('data:image/') || houseThumbnail.startsWith('/9j/') || houseThumbnail.startsWith('iVBOR'));

  return (
    <TouchableOpacity
      style={styles.houseDescriptionContainer}
      onPress={handleRedfinPress}
      activeOpacity={redfinUrl ? 0.8 : 1}
    >
      <View style={styles.houseDescriptionContent}>
        {isValidThumbnail ? (
          <Image 
            source={{ uri: houseThumbnail }}
            style={styles.houseIcon}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.houseIcon}>🏠</Text>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.houseDescriptionText}>
            {redfinDescription}
          </Text>
          {redfinUrl && (
            <Text style={styles.redfinLink}>
              View on Redfin →
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Category selector component
const CategorySelector = React.memo(({ 
  places, 
  selectedCategory, 
  onCategorySelect 
}: { 
  places: BuyHousePlace[]; 
  selectedCategory: string | null; 
  onCategorySelect: (category: string | null) => void; 
}) => {
  // Get unique categories and their counts
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    places.forEach(place => {
      const category = place.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    
    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      name: category,
      count,
      color: places.find(p => p.category === category)?.color || '#666'
    }));
  }, [places]);

  if (categories.length <= 1) {
    return null; // Don't show selector if there's only one category or no categories
  }

  return (
    <View style={styles.categorySelectorContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categorySelectorScrollView}
      >
        {/* All categories button */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === null && styles.categoryButtonSelected
          ]}
          onPress={() => onCategorySelect(null)}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === null && styles.categoryButtonTextSelected
          ]}>
            All
          </Text>
          <Text style={[
            styles.categoryCount,
            selectedCategory === null && styles.categoryCountSelected
          ]}>
            ({places.length})
          </Text>
        </TouchableOpacity>

        {/* Individual category buttons */}
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category.name 
                  ? category.color 
                  : category.color + '20', // 20% opacity for unselected
                borderColor: category.color,
              },
              selectedCategory === category.name && styles.categoryButtonSelected
            ]}
            onPress={() => onCategorySelect(category.name)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.categoryButtonText,
              {
                color: selectedCategory === category.name ? 'white' : category.color,
              },
              selectedCategory === category.name && styles.categoryButtonTextSelected
            ]}>
              {category.name}
            </Text>
            <Text style={[
              styles.categoryCount,
              {
                color: selectedCategory === category.name 
                  ? 'rgba(255, 255, 255, 0.8)' 
                  : category.color + '80', // 50% opacity for unselected count
              },
              selectedCategory === category.name && styles.categoryCountSelected
            ]}>
              ({category.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

// Individual marker component for better performance
const PlaceMarker = ({
  place,
  isSelected,
  onPress,
}: {
  place: BuyHousePlace;
  isSelected: boolean;
  onPress: () => void;
}) => {
    // Additional validation to ensure coordinates are valid
    if (!isValidCoordinate(place.location.latitude) || !isValidCoordinate(place.location.longitude)) {
      console.warn('Invalid coordinates for place:', place.name, place.location);
      return null;
    }
    
    console.log('Rendering PlaceMarker:', {
      name: place.name,
      coordinate: {
        latitude: place.location.latitude,
        longitude: place.location.longitude,
      },
      pinColor: isSelected ? 'green' : place.color || 'red',
      isSelected,
      zIndex: isSelected ? 1000 : 99,
    });
    
    return (
      <Marker
        coordinate={{
          latitude: place.location.latitude,
          longitude: place.location.longitude,
        }}
        title={place.name}
        description={place.location.address}
        pinColor={isSelected ? 'green' : place.color || 'red'}
        onPress={onPress}
        tracksViewChanges={false}
        opacity={1}
        zIndex={isSelected ? 1000 : 99}
        flat={true}
        anchor={{ x: 0.5, y: 1.0 }}
        centerOffset={{ x: 0, y: 0 }}
      />
    );
  };

// Map component
const BuyHouseMap = ({
  places,
  polygons,
  selectedPlaceId,
  userLocation,
  mapRegion,
  onMarkerPress,
  mapRef,
}: {
  places: BuyHousePlace[];
  polygons: BuyHousePolygon[];
  selectedPlaceId: string | null;
  userLocation: any;
  mapRegion: any;
  onMarkerPress: (placeId: string) => void;
  mapRef: React.RefObject<MapView | null>;
}) => {
    const validPlaces = useMemo(
      () =>
        places.filter(
          (place) =>
            isValidCoordinate(place.location.latitude) &&
            isValidCoordinate(place.location.longitude)
        ),
      [places]
    );

    console.log('MapView render - mapRegion:', mapRegion);
    console.log('MapView render - places count (input):', places.length);
    console.log('MapView render - validPlaces count:', validPlaces.length);
    console.log('MapView render - polygons count:', polygons.length);
    console.log('MapView render - selectedPlaceId:', selectedPlaceId);
    console.log('MapView render - validPlaces:', validPlaces.map(p => ({ name: p.name, category: p.category })));
    
    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          zoomEnabled={true}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          liteMode={false}
          mapType="standard"
        >
          {/* Drive time polygons */}
          {polygons
            .map((polygon, index) => {
              const coordinates = polygon.coordinates.map((coord) => ({
                latitude: coord[1],
                longitude: coord[0],
              }));

              // Validate coordinates
              const validCoordinates = coordinates.filter(
                (coord) =>
                  isValidCoordinate(coord.latitude) &&
                  isValidCoordinate(coord.longitude)
              );

              // Only render if we have at least 3 valid coordinates
              if (validCoordinates.length < 3) {
                return null;
              }

              // Convert hex color to rgba for proper opacity handling
              const hexToRgba = (hex: string, alpha: number) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
              };
              
              return (
                <Polygon
                  key={`polygon-${polygon.id || index}`}
                  coordinates={validCoordinates}
                  fillColor={hexToRgba(polygon.color, polygon.opacity)}
                  strokeColor={polygon.color}
                  strokeWidth={2}
                  zIndex={10}
                />
              );
            })
            .filter(Boolean)}

          {/* Place markers with custom dots */}
          {validPlaces.map((place, index) => {
            const markerKey = `marker-${place.id || 'no-id'}-${place.category}-${index}`;
            console.log(`Rendering marker ${index + 1}/${validPlaces.length}:`, place.name, place.location, 'key:', markerKey);
            
            // Use category color, or green if selected, or red as fallback
            const markerColor = selectedPlaceId === place.id ? 'green' : (place.color || 'red');
            
            return (
              <Marker
                key={markerKey}
                coordinate={{
                  latitude: place.location.latitude,
                  longitude: place.location.longitude,
                }}
                onPress={() => onMarkerPress(place.id)}
              >
                <View style={{
                  backgroundColor: markerColor,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: 'white',
                }} />
              </Marker>
            );
          })}

          {/* Alternative approaches (commented out):
          
          // 1. Simple dots with small circles
          <Circle
            center={coordinate}
            radius={20} // Small radius for dot effect
            fillColor="red"
            strokeColor="white"
            strokeWidth={2}
          />
          
          // 2. Custom marker with image
          <Marker coordinate={coordinate}>
            <Image 
              source={require('../assets/custom-marker.png')} 
              style={{width: 30, height: 30}}
            />
          </Marker>
          
          // 3. Text-based markers
          <Marker coordinate={coordinate}>
            <View style={{
              backgroundColor: 'red',
              borderRadius: 15,
              width: 30,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{color: 'white', fontSize: 12}}>📍</Text>
            </View>
          </Marker>
          
          // 4. Polyline points (for route-style visualization)
          <Polyline
            coordinates={[coordinate]}
            strokeColor="red"
            strokeWidth={5}
            lineCap="round"
          />
          */}

          {/* User location marker with house icon */}
          {userLocation && isValidCoordinate(userLocation.latitude) && isValidCoordinate(userLocation.longitude) && (
            <Marker
              key="user-location-marker"
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="Your House"
              description="You are here"
            >
              <View style={{
                backgroundColor: '#007AFF',
                width: 24,
                height: 24,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'white',
              }}>
                <Text style={{ fontSize: 14, color: 'white' }}>🏠</Text>
              </View>
            </Marker>
          )}
        </MapView>
      </View>
    );
  };

// Main component
export function BuyHouseResult({
  data,
  onPlaceSelect,
  isLoading = false,
}: BuyHouseResultProps) {
  const {
    location: userLocation,
    isLoading: locationLoading,
    errorMsg: locationError,
    getCurrentLocation,
  } = useLocation();

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const hasAutoSelectedRef = useRef<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const mapViewRef = useRef<MapView>(null);

  // Get dataset name and features
  const datasetName = data?.datasetName;
  let features = data?.[datasetName]?.features || data?.[datasetName]?.content?.features;
  
  // If still no features, try to find them in the data structure
  if (!features && data) {
    // Look for any property that contains features
    for (const key in data) {
      if (data[key] && typeof data[key] === 'object' && data[key].features) {
        features = data[key].features;
        console.log('Found features in data key:', key);
        break;
      }
    }
  }
  
  // Extract Redfin data
  const redfinUrl = data?.redfinUrl;
  const redfinDescription = data?.redfinDescription;
  const houseThumbnail = data?.houseThumbnail;

  // Try to get location if not available
  React.useEffect(() => {
    if (!userLocation && !locationLoading && !locationError) {
      getCurrentLocation();
    }
  }, [userLocation, locationLoading, locationError, getCurrentLocation]);

  // Process GeoJSON data using custom hook
  const { places, polygons } = useBuyHouseData(features);
  
  // Filter places based on selected category
  const filteredPlaces = useMemo(() => {
    console.log('Filtering places - selectedCategory:', selectedCategory);
    console.log('Filtering places - total places:', places.length);
    console.log('Filtering places - all categories:', [...new Set(places.map(p => p.category))]);
    
    if (!selectedCategory) {
      console.log('No category selected, returning all places');
      return places;
    }
    
    const filtered = places.filter(place => place.category === selectedCategory);
    console.log('Filtered places for category', selectedCategory, ':', filtered.length);
    console.log('Filtered place names:', filtered.map(p => p.name));
    
    return filtered;
  }, [places, selectedCategory]);
  
  // Debug: Check for duplicate place IDs
  React.useEffect(() => {
    const placeIds = filteredPlaces.map(place => place.id);
    const uniqueIds = new Set(placeIds);
    if (placeIds.length !== uniqueIds.size) {
      console.warn('Duplicate place IDs found:', placeIds.filter((id, index) => placeIds.indexOf(id) !== index));
    }
    
    console.log('Filtered places for rendering:', filteredPlaces.map(place => ({
      id: place.id,
      name: place.name,
      category: place.category,
      color: place.color,
      location: place.location,
    })));
  }, [filteredPlaces]);
  
  // Debug logging
  console.log('BuyHouseResult debug:', {
    datasetName,
    hasFeatures: !!features,
    featuresLength: features?.length,
    placesLength: places?.length,
    polygonsLength: polygons?.length,
    dataKeys: Object.keys(data || {}),
  });
  

  // Initialize map view to show 10-minute drive polygon
  React.useEffect(() => {
    hasAutoSelectedRef.current = false;
    setSelectedPlaceId(null);

    // Zoom to 10-minute drive polygon on initialization
    if (mapViewRef.current && polygons.length > 0) {
      // Find the 10-minute drive polygon (usually the second one)
      const tenMinPolygon = polygons.find(polygon => 
        polygon.category === '10_minutes_drive_area' || 
        polygon.category.includes('10')
      ) || polygons[polygons.length - 1]; // Fallback to last polygon if 10-min not found
      
      if (tenMinPolygon) {
        const coordinates = tenMinPolygon.coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        
        const validCoordinates = coordinates.filter(
          (coord) =>
            isValidCoordinate(coord.latitude) &&
            isValidCoordinate(coord.longitude)
        );
        
        if (validCoordinates.length >= 3) {
          const latitudes = validCoordinates.map(coord => coord.latitude);
          const longitudes = validCoordinates.map(coord => coord.longitude);
          
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);
          
          const latDelta = Math.max(
            (maxLat - minLat) * 1.05, // Add 5% padding
            MIN_ZOOM_DELTA
          );
          const lngDelta = Math.max(
            (maxLng - minLng) * 1.05, // Add 5% padding
            MIN_ZOOM_DELTA
          );
          
          const region = {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
          };
          
          console.log('Initializing map view to 10-minute drive polygon');
          mapViewRef.current.animateToRegion(region, MAP_ANIMATION_DURATION);
        }
      }
    }
  }, [polygons]); // Only depend on polygons, not filteredPlaces

  // Calculate map region
  const mapRegion = useMemo(
    () => {
      console.log('Calculating map region for:', {
        filteredPlacesCount: filteredPlaces.length,
        selectedPlaceId,
        polygonsCount: polygons.length
      });
      const region = calculateMapRegion(filteredPlaces, selectedPlaceId, polygons);
      console.log('Calculated map region:', region);
      return region;
    },
    [filteredPlaces, selectedPlaceId, polygons]
  );

  // Event handlers
  const handlePlacePress = useCallback(
    (placeId: string) => {
      setSelectedPlaceId(placeId);
      const selectedPlace = filteredPlaces.find((place) => place.id === placeId);
      if (selectedPlace) {
        onPlaceSelect?.(selectedPlace);
        
        // Zoom to the selected place on the map
        if (mapViewRef.current) {
          mapViewRef.current.animateToRegion(
            {
              latitude: selectedPlace.location.latitude,
              longitude: selectedPlace.location.longitude,
              latitudeDelta: DEFAULT_ZOOM_DELTA,
              longitudeDelta: DEFAULT_ZOOM_DELTA,
            },
            MAP_ANIMATION_DURATION
          );
        }
      }
    },
    [filteredPlaces, onPlaceSelect]
  );

  const handleMarkerPress = useCallback((placeId: string) => {
    setSelectedPlaceId(placeId);
    // Scroll to the corresponding candidate view
    const candidateIndex = filteredPlaces.findIndex((c: BuyHousePlace) => c.id === placeId);
    if (candidateIndex !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: candidateIndex * 292, // 280 (width) + 12 (marginRight)
        animated: true,
      });
    }
  }, [filteredPlaces]);

  // Handle category selection
  const handleCategorySelect = useCallback((category: string | null) => {
    console.log('Category selected:', category);
    console.log('Current selectedPlaceId before reset:', selectedPlaceId);
    setSelectedCategory(category);
    setSelectedPlaceId(null); // Reset selected place when changing categories
    console.log('Reset selectedPlaceId to null');
    
    // Zoom to the bounding box of the filtered places for the selected category
    if (mapViewRef.current) {
      // Get the filtered places for the selected category
      const placesToShow = category ? places.filter(place => place.category === category) : places;
      
      if (placesToShow.length > 0) {
        // Calculate bounding box from the places
        const validPlaces = placesToShow.filter(place => 
          isValidCoordinate(place.location.latitude) && 
          isValidCoordinate(place.location.longitude)
        );
        
        if (validPlaces.length > 0) {
          const latitudes = validPlaces.map(place => place.location.latitude);
          const longitudes = validPlaces.map(place => place.location.longitude);
          
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);
          
          const latDelta = Math.max(
            (maxLat - minLat) * 1.4, // Add 40% padding
            MIN_ZOOM_DELTA
          );
          const lngDelta = Math.max(
            (maxLng - minLng) * 1.4, // Add 40% padding
            MIN_ZOOM_DELTA
          );
          
          const region = {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
          };
          
          console.log('Zooming to bounding box for category:', category, 'places count:', validPlaces.length);
          console.log('Bounding box region:', region);
          mapViewRef.current.animateToRegion(region, MAP_ANIMATION_DURATION);
        }
      }
    }
  }, [polygons]);

  // Show loading state
  if (
    isLoading ||
    !data ||
    (typeof data === 'object' && Object.keys(data).length === 0)
  ) {
    return <LoadingAnimation />;
  }

  // Show no places state
  if (places.length === 0) {
    return <NoPlacesFound data={data} />;
  }

  return (
    <View style={styles.container}>
      {/* House Description */}
      <HouseDescription 
        redfinDescription={redfinDescription}
        redfinUrl={redfinUrl}
        houseThumbnail={houseThumbnail}
      />
      
      {/* Category Selector */}
      <CategorySelector
        places={places}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />
      
      {/* Map */}
      {(filteredPlaces.length > 0 || polygons.length > 0) && mapRegion && mapViewRef && (
        <BuyHouseMap
          key={`map-${selectedCategory || 'all'}-${filteredPlaces.length}`}
          places={filteredPlaces}
          polygons={polygons}
          selectedPlaceId={selectedPlaceId}
          userLocation={userLocation}
          mapRegion={mapRegion}
          onMarkerPress={handleMarkerPress}
          mapRef={mapViewRef}
        />
      )}

      {/* Place cards */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {filteredPlaces.map((place: BuyHousePlace, index: number) => {
          const cardKey = `place-card-${place.id || 'no-id'}-${place.category}-${index}`;
          console.log(`Rendering place card ${index + 1}/${filteredPlaces.length}:`, place.name, 'key:', cardKey);
          return (
            <TouchableOpacity
              key={cardKey}
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

              {/* Category and Distance */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: place.color + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: place.color,
                      fontWeight: '500',
                    }}
                  >
                    {place.category}
                  </Text>
                </View>
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
              {place.categories && place.categories.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginBottom: 12,
                  }}
                >
                  {place.categories.map((category, categoryIndex) => (
                    <View
                      key={`${place.id || 'no-id'}-category-${category.id || category.name}-${categoryIndex}`}
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
              )}

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
            </View>
          </TouchableOpacity>
        );
        })}
      </ScrollView>
    </View>
  );
} 