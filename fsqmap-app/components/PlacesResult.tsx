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
} from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';

// Types
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
  color?: string; // Add color property for consistent styling
}

interface GeoJSONPointFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    categories: Category[];
    chains?: Chain[];
    distance: number;
    phone?: string;
    website?: string;
    rating?: number;
    price?: number;
    hours?: any;
    description?: string;
    email?: string;
    attributes?: any;
    photos?: any;
    popularity?: number;
    verified?: boolean;
    socialMedia?: SocialMedia;
    stats?: any;
    tastes?: any;
    tips?: any;
    dateCreated: string;
    dateRefreshed: string;
    dateClosed?: string;
    extendedLocation?: {
      dma: string;
      census_block_id: string;
    };
    hoursPopular?: any;
    link: string;
    menu?: any;
    placemakerUrl: string;
    storeId?: string;
    relatedPlaces: RelatedPlaces;
    latitude?: number;
    longitude?: number;
    color?: string; // Add color property
  };
}

interface GeoJSONPolygonFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][];
  };
  properties: {
    time?: number;
    distance?: number;
    color?: string;
    opacity?: number;
    [key: string]: any;
  };
}

type GeoJSONFeature = GeoJSONPointFeature | GeoJSONPolygonFeature;

interface IsochronePolygon {
  id: string;
  coordinates: [number, number][];
  time?: number;
  distance?: number;
  color?: string;
  opacity?: number;
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface PlacesData {
  type: 'geojson';
  content: GeoJSONData;
}

interface PlacesResultProps {
  data: PlacesData | any;
  onPlaceSelect?: (place: Place) => void;
  isLoading?: boolean;
}

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
  debugText: {
    fontSize: 10,
    color: '#ccc',
    textAlign: 'center',
    fontFamily: 'monospace',
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

const extractCoordinates = (
  feature: GeoJSONPointFeature
): { latitude: number; longitude: number } | null => {
  const { geometry, properties } = feature;

  // Try geometry coordinates first
  if (isValidGeometry(geometry)) {
    const [longitude, latitude] = geometry.coordinates;
    if (isValidCoordinate(longitude) && isValidCoordinate(latitude)) {
      return { latitude, longitude };
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

const convertGeoJSONFeatureToPlace = (
  feature: GeoJSONPointFeature
): Place | null => {
  const { properties } = feature;
  const coordinates = extractCoordinates(feature);

  if (!coordinates) {
    console.log('convertGeoJSONFeatureToPlace: No coordinates found for feature', feature.id);
    return null;
  }

  return {
    id: properties.id,
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
    chains: properties.chains,
    distance: properties.distance || 0,
    phone: properties.phone,
    website: properties.website,
    socialMedia: properties.socialMedia,
    dateCreated: properties.dateCreated,
    dateRefreshed: properties.dateRefreshed,
    extendedLocation: properties.extendedLocation,
    link: properties.link,
    placemakerUrl: properties.placemakerUrl,
    relatedPlaces: properties.relatedPlaces || {},
    color: properties.color || '#007AFF', // Default color
  };
};

const convertGeoJSONFeatureToIsochrone = (
  feature: GeoJSONPolygonFeature
): IsochronePolygon | null => {
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
    time: properties.time,
    distance: properties.distance,
    color: properties.color || '#007AFF',
    opacity: properties.opacity || 0.3,
  };
};

// Custom hook for places data processing
const usePlacesData = (features: GeoJSONFeature[] | undefined) => {
  return useMemo(() => {
    if (!features || features.length === 0) {
      console.log('usePlacesData: No features found');
      return { places: [], isochrones: [] };
    }

    try {
      console.log('usePlacesData: Processing', features.length, 'features');
      
      const pointFeatures = features.filter(
        (feature: GeoJSONFeature) => feature.geometry?.type === 'Point'
      ) as GeoJSONPointFeature[];

      const polygonFeatures = features.filter(
        (feature: GeoJSONFeature) => feature.geometry?.type === 'Polygon'
      ) as GeoJSONPolygonFeature[];

      console.log('usePlacesData: Found', pointFeatures.length, 'points and', polygonFeatures.length, 'polygons');

      const places = pointFeatures
        .map(convertGeoJSONFeatureToPlace)
        .filter(Boolean) as Place[];

      const isochrones = polygonFeatures
        .map(convertGeoJSONFeatureToIsochrone)
        .filter(Boolean) as IsochronePolygon[];

      console.log('usePlacesData: Converted to', places.length, 'places and', isochrones.length, 'isochrones');

      return { places, isochrones };
    } catch (error) {
      console.error('Error processing places data:', error);
      return { places: [], isochrones: [] };
    }
  }, [features]);
};

const calculateMapRegion = (
  places: Place[],
  selectedPlaceId: string | null,
  isochrones: IsochronePolygon[] = []
) => {
  if (places.length === 0 && isochrones.length === 0) return null;

  const validPlaces = places.filter(
    (place) =>
      isValidCoordinate(place.location.latitude) &&
      isValidCoordinate(place.location.longitude)
  );

  const validIsochrones = isochrones.filter(
    (polygon) =>
      polygon.coordinates.length >= 3 &&
      polygon.coordinates.every(
        (coord) => isValidCoordinate(coord[1]) && isValidCoordinate(coord[0])
      )
  );

  if (validPlaces.length === 0 && validIsochrones.length === 0) {
    return null;
  }

  console.log('calculateMapRegion: Found', validPlaces.length, 'valid places and', validIsochrones.length, 'valid isochrones');

  // If we have isochrones, prioritize them for the map region
  if (validIsochrones.length > 0) {
    const allLatitudes: number[] = [];
    const allLongitudes: number[] = [];

    // Add isochrone coordinates first
    validIsochrones.forEach((polygon) => {
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

    // Use a smaller padding factor for isochrones to show more detail
    const isochronePaddingFactor = 1.05;
    const latDelta = Math.max(
      Math.min(
        (maxLat - minLat) * isochronePaddingFactor,
        MAX_ZOOM_DELTA
      ),
      MIN_ZOOM_DELTA
    );
    const lngDelta = Math.max(
      Math.min(
        (maxLng - minLng) * isochronePaddingFactor,
        MAX_ZOOM_DELTA
      ),
      MIN_ZOOM_DELTA
    );

    console.log('calculateMapRegion: Isochrone-based region:', {
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

  // Focus on selected place if no isochrones and a place is selected
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
  
  // If no places but we have isochrones, use the first isochrone as default
  if (validIsochrones.length > 0) {
    const firstIsochrone = validIsochrones[0];
    const coordinates = firstIsochrone.coordinates.map((coord) => ({
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
      
      console.log('calculateMapRegion: Isochrone-only region:', {
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
    <Text style={styles.loadingText}>Searching for places...</Text>
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
    <Text style={styles.noPlacesText}>No places found</Text>
    <Text style={styles.noPlacesSubtext}>
      Try searching for a different location or category
    </Text>
  </View>
));

// Individual marker component for better performance
const PlaceMarker = React.memo(
  ({
    place,
    isSelected,
    onPress,
  }: {
    place: Place;
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
  }
);

// Map component
const PlacesMap = React.memo(
  ({
    places,
    isochronePolygons,
    selectedPlaceId,
    userLocation,
    mapRegion,
    onMarkerPress,
    mapRef,
  }: {
    places: Place[];
    isochronePolygons: IsochronePolygon[];
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
    console.log('MapView render - isochrones count:', isochronePolygons.length);
    console.log('MapView render - selectedPlaceId:', selectedPlaceId);
    console.log('MapView render - validPlaces:', validPlaces.map(p => ({ name: p.name, color: p.color })));
    
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
          {/* Isochrone polygons */}
          {isochronePolygons
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
                  key={`isochrone-${polygon.id || index}`}
                  coordinates={validCoordinates}
                  fillColor={hexToRgba(polygon.color || '#007AFF', polygon.opacity || 0.3)}
                  strokeColor={polygon.color || '#007AFF'}
                  strokeWidth={2}
                  zIndex={10}
                />
              );
            })
            .filter(Boolean)}

          {/* Place markers with custom dots */}
          {validPlaces.map((place, index) => {
            const markerKey = `marker-${place.id || 'no-id'}-${index}`;
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

          {/* User location marker */}
          {userLocation && isValidCoordinate(userLocation.latitude) && isValidCoordinate(userLocation.longitude) && (
            <Marker
              key="user-location-marker"
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="Your Location"
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
                <Text style={{ fontSize: 14, color: 'white' }}>📍</Text>
              </View>
            </Marker>
          )}
        </MapView>
      </View>
    );
  }
);

// Main component
export function PlacesResult({
  data,
  onPlaceSelect,
  isLoading = false,
}: PlacesResultProps) {
  const {
    location: userLocation,
    isLoading: locationLoading,
    errorMsg: locationError,
    getCurrentLocation,
  } = useLocation();

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
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

  // Try to get location if not available
  React.useEffect(() => {
    if (!userLocation && !locationLoading && !locationError) {
      getCurrentLocation();
    }
  }, [userLocation, locationLoading, locationError, getCurrentLocation]);

  // Process GeoJSON data using custom hook
  const { places, isochrones } = usePlacesData(features);
  
  // Debug logging
  console.log('PlacesResult debug:', {
    datasetName,
    hasFeatures: !!features,
    featuresLength: features?.length,
    placesLength: places?.length,
    isochronesLength: isochrones?.length,
    dataKeys: Object.keys(data || {}),
  });

  // Auto-select first place
  React.useEffect(() => {
    hasAutoSelectedRef.current = false;
    setSelectedPlaceId(null);

    if (places.length > 0) {
      const firstPlace = places[0];
      setSelectedPlaceId(firstPlace.id);
      hasAutoSelectedRef.current = true;
      onPlaceSelect?.(firstPlace);
    }
  }, [places, onPlaceSelect]);

  // Initialize map view to show isochrone polygon
  React.useEffect(() => {
    // Zoom to isochrone polygon on initialization
    if (mapViewRef.current && isochrones.length > 0) {
      // Find the largest isochrone polygon (usually the one with the most coordinates)
      const largestIsochrone = isochrones.reduce((largest, current) => 
        current.coordinates.length > largest.coordinates.length ? current : largest
      );
      
      if (largestIsochrone) {
        const coordinates = largestIsochrone.coordinates.map((coord) => ({
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
          
          console.log('Initializing map view to isochrone polygon');
          mapViewRef.current.animateToRegion(region, MAP_ANIMATION_DURATION);
        }
      }
    }
  }, [isochrones]); // Only depend on isochrones

  // Calculate map region
  const mapRegion = useMemo(
    () => {
      console.log('Calculating map region for:', {
        placesCount: places.length,
        selectedPlaceId,
        isochronesCount: isochrones.length
      });
      const region = calculateMapRegion(places, selectedPlaceId, isochrones);
      console.log('Calculated map region:', region);
      return region;
    },
    [places, selectedPlaceId, isochrones]
  );

  // Event handlers
  const handlePlacePress = useCallback(
    (placeId: string) => {
      setSelectedPlaceId(placeId);
      const selectedPlace = places.find((place) => place.id === placeId);
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
    [places, onPlaceSelect]
  );

  const handleMarkerPress = useCallback((placeId: string) => {
    setSelectedPlaceId(placeId);
    // Scroll to the corresponding candidate view
    const candidateIndex = places.findIndex((c: Place) => c.id === placeId);
    if (candidateIndex !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: candidateIndex * 292, // 280 (width) + 12 (marginRight)
        animated: true,
      });
    }
  }, [places]);

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
      {/* Map */}
      {(places.length > 0 || isochrones.length > 0) && mapRegion && mapViewRef && (
        <PlacesMap
          key={`map-${places.length}-${isochrones.length}`}
          places={places}
          isochronePolygons={isochrones}
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
        {places.map((place: Place, index: number) => {
          const cardKey = `place-card-${place.id || 'no-id'}-${index}`;
          console.log(`Rendering place card ${index + 1}/${places.length}:`, place.name, 'key:', cardKey);
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
          );
        })}
      </ScrollView>
    </View>
  );
}
