import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface LocationState {
  location: LocationData | null;
  errorMsg: string | null;
  isLoading: boolean;
  hasPermission: boolean;
}

export const useLocation = () => {
  const [locationState, setLocationState] = useState<LocationState>({
    location: null,
    errorMsg: null,
    isLoading: true,
    hasPermission: false,
  });

  const requestLocationPermission = async () => {
    try {
      setLocationState(prev => ({ ...prev, isLoading: true, errorMsg: null }));
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationState(prev => ({
          ...prev,
          errorMsg: 'Permission to access location was denied',
          isLoading: false,
          hasPermission: false,
        }));
        return false;
      }

      setLocationState(prev => ({ ...prev, hasPermission: true }));
      return true;
    } catch (error) {
      setLocationState(prev => ({
        ...prev,
        errorMsg: 'Error requesting location permission',
        isLoading: false,
      }));
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationState(prev => ({ ...prev, isLoading: true, errorMsg: null }));

      // TESTING MODE: Return fixed coordinates for testing
      const testLocationData: LocationData = {
        latitude: 33.244265313491326,
        longitude: -111.86665736215393,
        // latitude: 33.24119094379804,
        // longitude: -111.87007934401359,
        accuracy: 5,
        altitude: 400,
        heading: 0,
        speed: 0,
        timestamp: Date.now(),
      };

      setLocationState(prev => ({
        ...prev,
        location: testLocationData,
        isLoading: false,
        hasPermission: true,
      }));

      console.log('TESTING MODE: Returning fixed coordinates:', testLocationData);
      return testLocationData;

      // Original code commented out for testing
      /*
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        altitude: location.coords.altitude ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
        timestamp: location.timestamp,
      };

      setLocationState(prev => ({
        ...prev,
        location: locationData,
        isLoading: false,
      }));

      return locationData;
      */
    } catch (error) {
      setLocationState(prev => ({
        ...prev,
        errorMsg: 'Error getting current location',
        isLoading: false,
      }));
      return null;
    }
  };

  const startLocationUpdates = async () => {
    try {
      setLocationState(prev => ({ ...prev, isLoading: true, errorMsg: null }));

      // TESTING MODE: Return fixed coordinates for testing
      const testLocationData: LocationData = {
        latitude: 33.244265313491326,
        longitude: -111.86665736215393,
        accuracy: 5,
        altitude: 400,
        heading: 0,
        speed: 0,
        timestamp: Date.now(),
      };

      setLocationState(prev => ({
        ...prev,
        location: testLocationData,
        isLoading: false,
        hasPermission: true,
      }));

      console.log('TESTING MODE: Returning fixed coordinates for location updates:', testLocationData);
      
      // Return a mock subscription object for testing
      return {
        remove: () => {
          console.log('TESTING MODE: Mock location subscription removed');
        }
      };

      // Original code commented out for testing
      /*
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? undefined,
            altitude: location.coords.altitude ?? undefined,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
            timestamp: location.timestamp,
          };

          setLocationState(prev => ({
            ...prev,
            location: locationData,
            isLoading: false,
          }));
        }
      );

      return locationSubscription;
      */
    } catch (error) {
      setLocationState(prev => ({
        ...prev,
        errorMsg: 'Error starting location updates',
        isLoading: false,
      }));
      return null;
    }
  };

  // Check permission on mount and get location if permission is granted
  useEffect(() => {
    const checkPermissionAndGetLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      
      setLocationState(prev => ({
        ...prev,
        hasPermission,
        isLoading: false,
      }));

      // If permission is granted, try to get location
      if (hasPermission) {
        console.log('Location permission granted, getting current location...');
        getCurrentLocation();
      } else {
        console.log('Location permission not granted');
      }
    };

    checkPermissionAndGetLocation();
  }, []);

  return {
    ...locationState,
    getCurrentLocation,
    startLocationUpdates,
    requestLocationPermission,
  };
}; 