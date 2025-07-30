import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from './hooks/useLocation';
import CheckIn from './CheckIn';
import CheckInForm from './CheckInForm';
import FindPlace from './FindPlace';
import BuyHouse from './BuyHouse';
import SiteSelect from './SiteSelect';

const { width, height } = Dimensions.get('window');

type Screen = 'main' | 'checkIn' | 'checkInForm' | 'findPlace' | 'buyHouse' | 'siteSelect';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [checkInToolData, setCheckInToolData] = useState<any>(null);
  const {
    location,
    isLoading: locationLoading,
    errorMsg: locationError,
    getCurrentLocation,
    startLocationUpdates,
  } = useLocation();

  // Start continuous location updates when component mounts
  React.useEffect(() => {
    let locationSubscription: any = null;

    const initializeLocation = async () => {
      // First get initial location
      await getCurrentLocation();
      
      // Then start continuous updates
      locationSubscription = await startLocationUpdates();
    };

    initializeLocation();

    // Cleanup subscription when component unmounts
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const renderMainScreen = () => (
    <View style={styles.container}>
      {/* Loading indicator */}
      {locationLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}
      
      {/* Error message */}
      {locationError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getCurrentLocation}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map Background */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 37.78825,
          longitude: location?.longitude || -122.4324,
          latitudeDelta: 0.001, // Smaller delta for better centering
          longitudeDelta: 0.001, // Smaller delta for better centering
        }}
        region={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        } : undefined}
        showsUserLocation={true}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {/* Blue marker for user's current location */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            pinColor="blue"
          />
        )}
      </MapView>

      {/* Overlay with buttons */}
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>I'm George</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.checkInButton]}
            onPress={() => setCurrentScreen('checkIn')}
          >
            <Text style={styles.buttonText}>📍 checking in     </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.findPlaceButton]}
            onPress={() => setCurrentScreen('findPlace')}
          >
            <Text style={styles.buttonText}>🔍 finding place</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buyHouseButton]}
            onPress={() => setCurrentScreen('buyHouse')}
          >
            <Text style={styles.buttonText}>🏠  buying house</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.siteSelectButton]}
            onPress={() => setCurrentScreen('siteSelect')}
          >
            <Text style={styles.buttonText}>📊   selecting site</Text>
          </TouchableOpacity>

          {/* Horizontal separator line */}
          <View style={styles.separator} />

          {/* Foursquare Logo below the buttons */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>foursquare</Text>
          </View>
        </View>
        
        {/* Remove the old logo container */}
      </View>
    </View>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'checkIn':
        return <CheckIn 
          onBack={() => setCurrentScreen('main')} 
          onNavigateToForm={(toolData: any) => {
            setCheckInToolData(toolData);
            setCurrentScreen('checkInForm');
          }}
        />;
      case 'checkInForm':
        return <CheckInForm 
          onBack={() => setCurrentScreen('checkIn')} 
          toolData={checkInToolData}
        />;
      case 'findPlace':
        return <FindPlace onBack={() => setCurrentScreen('main')} />;
      case 'buyHouse':
        return <BuyHouse onBack={() => setCurrentScreen('main')} />;
      case 'siteSelect':
        return <SiteSelect onBack={() => setCurrentScreen('main')} />;
      default:
        return renderMainScreen();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: width * 0.8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  checkInButton: {
    backgroundColor: '#FF6B6B',
  },
  findPlaceButton: {
    backgroundColor: '#4ECDC4',
  },
  buyHouseButton: {
    backgroundColor: '#45B7D1',
  },
  siteSelectButton: {
    backgroundColor: '#96CEB4',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    justifyContent: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    fontFamily: 'monospace',
  },
  logoContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
