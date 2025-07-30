import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { NavigationBar } from './components/NavigationBar';
import { useLocation } from './hooks/useLocation';
import { GeotaggingCandidateData } from './types/Places';

interface CheckInFormProps {
  onBack?: () => void;
  toolData?: GeotaggingCandidateData;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  discount: string;
  imageUrl: string;
}

interface MediaFile {
  uri: string;
  type: 'photo' | 'video';
  name: string;
}

export default function CheckInForm({ onBack, toolData }: CheckInFormProps) {
  const { location } = useLocation();
  const [venueName, setVenueName] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVenue, setSelectedVenue] =
    useState<GeotaggingCandidateData | null>(toolData || null);

  // New state for deals
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);

  // New state for social media
  const [socialMediaSettings, setSocialMediaSettings] = useState({
    facebook: false,
    instagram: false,
    twitter: false,
    foursquare: true, // Default to true since this is Foursquare app
  });

  // New state for media upload
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // Mock deals data - in a real app, this would come from the venue's API
  const mockDeals: Deal[] = [
    {
      id: '1',
      title: '20% Off Appetizers',
      description: 'Valid on all appetizers from 4-7 PM',
      originalPrice: '$15.99',
      discountedPrice: '$12.79',
      discount: '20% OFF',
      imageUrl:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    },
    {
      id: '2',
      title: 'Happy Hour Special',
      description: 'Half-price drinks from 5-7 PM',
      originalPrice: '$12.00',
      discountedPrice: '$6.00',
      discount: '50% OFF',
      imageUrl:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
    },
    {
      id: '3',
      title: 'Weekend Brunch Deal',
      description: 'Free mimosa with any brunch entrée',
      originalPrice: '$18.99',
      discountedPrice: '$18.99',
      discount: 'FREE MIMOSA',
      imageUrl:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
    },
  ];

  // Log the toolData to see what's available
  React.useEffect(() => {
    if (toolData) {
      console.log('CheckInForm received toolData:', toolData);
    }
  }, [toolData]);


  const handleDealToggle = (dealId: string) => {
    setSelectedDeals((prev) =>
      prev.includes(dealId)
        ? prev.filter((id) => id !== dealId)
        : [...prev, dealId]
    );
  };

  const handleSocialMediaToggle = (
    platform: keyof typeof socialMediaSettings
  ) => {
    setSocialMediaSettings((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const requestMediaPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } =
      await MediaLibrary.requestPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera and media library permissions are required to upload photos and videos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newMediaFile: MediaFile = {
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
          name: asset.fileName || `media_${Date.now()}`,
        };
        setMediaFiles((prev) => [...prev, newMediaFile]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newMediaFile: MediaFile = {
          uri: asset.uri,
          type: 'photo',
          name: `photo_${Date.now()}`,
        };
        setMediaFiles((prev) => [...prev, newMediaFile]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!venueName.trim()) {
      Alert.alert('Error', 'Please enter a venue name');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location not available. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call with all the new data
      const checkInData = {
        venue: selectedVenue,
        venueName,
        category,
        notes,
        location,
        selectedDeals,
        socialMediaSettings,
        mediaFiles,
      };

      console.log('Submitting check-in data:', checkInData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success!', `Successfully checked in at ${venueName}`, [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setVenueName('');
            setCategory('');
            setNotes('');
            setSelectedVenue(null);
            setSelectedDeals([]);
            setSocialMediaSettings({
              facebook: false,
              instagram: false,
              twitter: false,
              foursquare: true,
            });
            setMediaFiles([]);
            // Navigate back
            onBack?.();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to check in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDealCard = (deal: Deal) => {
    const isSelected = selectedDeals.includes(deal.id);

    return (
      <View
        key={deal.id}
        style={[styles.dealCard, isSelected && styles.dealCardSelected]}
      >
        <Image source={{ uri: deal.imageUrl }} style={styles.dealImage} />
        <View style={styles.dealInfo}>
          <Text style={styles.dealTitle}>{deal.title}</Text>
          <Text style={styles.dealDescription}>{deal.description}</Text>
          <View style={styles.dealPriceContainer}>
            <Text style={styles.dealOriginalPrice}>{deal.originalPrice}</Text>
            <Text style={styles.dealDiscountedPrice}>
              {deal.discountedPrice}
            </Text>
          </View>
        </View>
        <Switch
          value={isSelected}
          onValueChange={() => handleDealToggle(deal.id)}
          trackColor={{ false: '#E1E5E9', true: '#FF6B6B' }}
          thumbColor={isSelected ? '#fff' : '#f4f3f4'}
        />
      </View>
    );
  };

  const renderMediaPreview = (media: MediaFile, index: number) => (
    <View key={index} style={styles.mediaPreviewContainer}>
      <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
      <TouchableOpacity
        style={styles.removeMediaButton}
        onPress={() => removeMediaFile(index)}
      >
        <Text style={styles.removeMediaButtonText}>×</Text>
      </TouchableOpacity>
      <Text style={styles.mediaTypeText}>
        {media.type === 'video' ? '🎥' : '📷'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <NavigationBar title="Check In Form" onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Check In</Text>
          <Text style={styles.subtitle}>
            Share where you are and what you're up to
          </Text>
        </View>

        <View style={styles.form}>
          {/* Enhanced Venue Details */}
          {selectedVenue && (
            <View style={styles.venueDetails}>
              <Text style={styles.venueDetailsLabel}>📍 Venue Details</Text>

              <View style={styles.venueDetailRow}>
                <Text style={styles.venueDetailLabel}>Name:</Text>
                <Text style={styles.venueDetailValue}>
                  {selectedVenue.name}
                </Text>
              </View>

              {selectedVenue.location?.address && (
                <View style={styles.venueDetailRow}>
                  <Text style={styles.venueDetailLabel}>Address:</Text>
                  <Text style={styles.venueDetailValue}>
                    {selectedVenue.location.address}
                  </Text>
                </View>
              )}

              {selectedVenue.phone && (
                <View style={styles.venueDetailRow}>
                  <Text style={styles.venueDetailLabel}>Phone:</Text>
                  <Text style={styles.venueDetailValue}>
                    {selectedVenue.phone}
                  </Text>
                </View>
              )}

              {selectedVenue.website && (
                <View style={styles.venueDetailRow}>
                  <Text style={styles.venueDetailLabel}>Website:</Text>
                  <Text style={styles.venueDetailValue}>
                    {selectedVenue.website}
                  </Text>
                </View>
              )}

              {selectedVenue.hours?.display && (
                <View style={styles.venueDetailRow}>
                  <Text style={styles.venueDetailLabel}>Hours:</Text>
                  <Text style={styles.venueDetailValue}>
                    {selectedVenue.hours.display}
                  </Text>
                </View>
              )}

              {selectedVenue.rating && (
                <View style={styles.venueDetailRow}>
                  <Text style={styles.venueDetailLabel}>Rating:</Text>
                  <Text style={styles.venueDetailValue}>
                    ⭐ {selectedVenue.rating}
                  </Text>
                </View>
              )}

              {selectedVenue.price && (
                <View style={styles.venueDetailRow}>
                  <Text style={styles.venueDetailLabel}>Price:</Text>
                  <Text style={styles.venueDetailValue}>
                    {Array(selectedVenue.price).fill('$').join('')}
                  </Text>
                </View>
              )}

              {selectedVenue.description && (
                <View style={styles.venueDetailRow}>
                  <Text style={styles.venueDetailLabel}>Description:</Text>
                  <Text style={styles.venueDetailValue}>
                    {selectedVenue.description}
                  </Text>
                </View>
              )}

              {selectedVenue.socialMedia && (
                <View style={styles.venueDetailRow}>
                  <Text style={styles.venueDetailLabel}>Social Media:</Text>
                  <View style={styles.socialMediaLinks}>
                    {selectedVenue.socialMedia.facebook_id && (
                      <Text style={styles.socialMediaLink}>📘 Facebook</Text>
                    )}
                    {selectedVenue.socialMedia.instagram && (
                      <Text style={styles.socialMediaLink}>📷 Instagram</Text>
                    )}
                    {selectedVenue.socialMedia.twitter && (
                      <Text style={styles.socialMediaLink}>🐦 Twitter</Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Deals Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Available Deals</Text>
            <Text style={styles.subLabel}>
              Select deals you'd like to use with this check-in
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dealsScroll}
              contentContainerStyle={styles.dealsContainer}
            >
              {mockDeals.map(renderDealCard)}
            </ScrollView>
          </View>

          {/* Social Media Publishing */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Share Check-in</Text>
            <Text style={styles.subLabel}>
              Choose where to publish your check-in
            </Text>
            <View style={styles.socialMediaContainer}>
              <View style={styles.socialMediaRow}>
                <Text style={styles.socialMediaLabel}>📘 Facebook</Text>
                <Switch
                  value={socialMediaSettings.facebook}
                  onValueChange={() => handleSocialMediaToggle('facebook')}
                  trackColor={{ false: '#E1E5E9', true: '#1877F2' }}
                  thumbColor={socialMediaSettings.facebook ? '#fff' : '#f4f3f4'}
                />
              </View>
              <View style={styles.socialMediaRow}>
                <Text style={styles.socialMediaLabel}>📷 Instagram</Text>
                <Switch
                  value={socialMediaSettings.instagram}
                  onValueChange={() => handleSocialMediaToggle('instagram')}
                  trackColor={{ false: '#E1E5E9', true: '#E4405F' }}
                  thumbColor={
                    socialMediaSettings.instagram ? '#fff' : '#f4f3f4'
                  }
                />
              </View>
              <View style={styles.socialMediaRow}>
                <Text style={styles.socialMediaLabel}>🐦 Twitter</Text>
                <Switch
                  value={socialMediaSettings.twitter}
                  onValueChange={() => handleSocialMediaToggle('twitter')}
                  trackColor={{ false: '#E1E5E9', true: '#1DA1F2' }}
                  thumbColor={socialMediaSettings.twitter ? '#fff' : '#f4f3f4'}
                />
              </View>
              <View style={styles.socialMediaRow}>
                <Text style={styles.socialMediaLabel}>📍 Foursquare</Text>
                <Switch
                  value={socialMediaSettings.foursquare}
                  onValueChange={() => handleSocialMediaToggle('foursquare')}
                  trackColor={{ false: '#E1E5E9', true: '#FF6B6B' }}
                  thumbColor={
                    socialMediaSettings.foursquare ? '#fff' : '#f4f3f4'
                  }
                />
              </View>
            </View>
          </View>

          {/* Media Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Add Photos/Videos</Text>
            <Text style={styles.subLabel}>
              Share your experience with photos or videos
            </Text>

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mediaPreviewScroll}
              >
                {mediaFiles.map((media, index) =>
                  renderMediaPreview(media, index)
                )}
              </ScrollView>
            )}

            {/* Upload Buttons */}
            <View style={styles.uploadButtonsContainer}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadButtonText}>
                  📁 Choose from Library
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                <Text style={styles.uploadButtonText}>📷 Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="What are you up to?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location Info */}
          {location && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>📍 Current Location</Text>
              <Text style={styles.locationText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!venueName.trim() || isSubmitting) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!venueName.trim() || isSubmitting}
          >
            <Text
              style={[
                styles.submitButtonText,
                (!venueName.trim() || isSubmitting) &&
                  styles.submitButtonTextDisabled,
              ]}
            >
              {isSubmitting ? 'Checking In...' : 'Check In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFBFC',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    backgroundColor: '#FAFBFC',
  },
  categoryButtonSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  venueScroll: {
    marginHorizontal: -4,
  },
  venueCard: {
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    minWidth: 200,
  },
  venueCardSelected: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FF6B6B',
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  venueNameSelected: {
    color: '#FF6B6B',
  },
  ratingContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  venueCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  venueDistance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  venuePrice: {
    fontSize: 12,
    color: '#666',
  },
  venueDetails: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  venueDetailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  venueDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  venueDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 80,
    marginRight: 8,
  },
  venueDetailValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  socialMediaLinks: {
    flex: 1,
  },
  socialMediaLink: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  dealCard: {
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 200,
    alignItems: 'center',
  },
  dealCardSelected: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FF6B6B',
  },
  dealImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  dealInfo: {
    width: '100%',
    marginBottom: 8,
  },
  dealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  dealDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  dealPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealOriginalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  dealDiscountedPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  socialMediaContainer: {
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    padding: 12,
  },
  socialMediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  socialMediaLabel: {
    fontSize: 16,
    color: '#333',
  },
  mediaPreviewScroll: {
    marginBottom: 12,
  },
  dealsScroll: {
    marginBottom: 12,
  },
  dealsContainer: {
    paddingRight: 16,
  },
  mediaPreviewContainer: {
    position: 'relative',
    marginRight: 12,
  },
  mediaPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaTypeText: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  locationInfo: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 8,
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
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#9E9E9E',
  },
});
