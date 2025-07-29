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
import FindPlace from './FindPlace';
import BuyHouse from './BuyHouse';
import SiteSelect from './SiteSelect';

const { width, height } = Dimensions.get('window');

type Screen = 'main' | 'checkIn' | 'findPlace' | 'buyHouse' | 'siteSelect';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const {
    location,
    isLoading: locationLoading,
    errorMsg: locationError,
    getCurrentLocation,
  } = useLocation();

  // Get location when component mounts
  React.useEffect(() => {
    getCurrentLocation();
  }, []);

  const renderMainScreen = () => (
    <View style={styles.container}>
      {/* Map Background */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 37.78825,
          longitude: location?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={false}
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
          <Text style={styles.title}>I am</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCurrentScreen('checkIn')}
          >
            <Text style={styles.buttonText}>checking in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setCurrentScreen('findPlace')}
          >
            <Text style={styles.buttonText}>finding a place</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setCurrentScreen('buyHouse')}
          >
            <Text style={styles.buttonText}>buying a house</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setCurrentScreen('siteSelect')}
          >
            <Text style={styles.buttonText}>site selecting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'checkIn':
        return <CheckIn onBack={() => setCurrentScreen('main')} />;
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
