import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTikTok } from '../hooks/useTikTok';
import { TIKTOK_PRIVACY_SETTINGS, TikTokContentData } from '../config/tiktok-api';

interface TikTokContentPostProps {
  venueName?: string;
  venueLocation?: string;
  onContentPosted?: (result: any) => void;
}

interface SelectedMedia {
  uri: string;
  type: 'photo' | 'video';
  name: string;
}

export const TikTokContentPost: React.FC<TikTokContentPostProps> = ({
  venueName,
  venueLocation,
  onContentPosted,
}) => {
  const {
    isAuthenticated,
    isUploading,
    uploadProgress,
    currentStep,
    uploadAndPublishVideo,
  } = useTikTok();

  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [caption, setCaption] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<keyof typeof TIKTOK_PRIVACY_SETTINGS>('PUBLIC');
  const [disableComments, setDisableComments] = useState(false);
  const [disableDuet, setDisableDuet] = useState(false);
  const [disableStitch, setDisableStitch] = useState(false);

  const requestMediaPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera and media library permissions are required to upload content to TikTok.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickMedia = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [9, 16], // TikTok's preferred aspect ratio
        quality: 0.8,
        videoMaxDuration: 60, // TikTok video limit
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newMedia: SelectedMedia = {
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
          name: asset.fileName || `media_${Date.now()}`,
        };
        setSelectedMedia([newMedia]); // TikTok allows one video per post
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  const takeVideo = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newMedia: SelectedMedia = {
          uri: asset.uri,
          type: 'video',
          name: `video_${Date.now()}`,
        };
        setSelectedMedia([newMedia]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record video. Please try again.');
    }
  };

  const removeMedia = () => {
    setSelectedMedia([]);
  };

  const generateCaption = () => {
    let generatedCaption = '';
    
    if (venueName) {
      generatedCaption += `📍 ${venueName}\n`;
    }
    
    if (venueLocation) {
      generatedCaption += `📍 ${venueLocation}\n`;
    }
    
    generatedCaption += `\n#foursquare #checkin #location #travel #foodie #lifestyle`;
    
    setCaption(generatedCaption);
  };

  const handlePostToTikTok = async () => {
    if (!isAuthenticated) {
      Alert.alert('Not Connected', 'Please connect your TikTok account first.');
      return;
    }

    if (selectedMedia.length === 0) {
      Alert.alert('No Media', 'Please select a video to post to TikTok.');
      return;
    }

    if (selectedMedia[0].type !== 'video') {
      Alert.alert('Video Required', 'TikTok only supports video uploads.');
      return;
    }

    try {
      const contentData: TikTokContentData = {
        title: caption || `Check-in at ${venueName || 'this location'}`,
        description: caption,
        privacy_level: privacyLevel,
        disable_comment: disableComments,
        disable_duet: disableDuet,
        disable_stitch: disableStitch,
        access_token: '', // Will be set by the API service
        open_id: '', // Will be set by the API service
      };

      const result = await uploadAndPublishVideo(selectedMedia[0].uri, contentData);
      
      Alert.alert(
        'Success!',
        `Video posted to TikTok successfully!\nShare ID: ${result.data.share_id}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onContentPosted?.(result);
              // Reset form
              setSelectedMedia([]);
              setCaption('');
              setPrivacyLevel('PUBLIC');
              setDisableComments(false);
              setDisableDuet(false);
              setDisableStitch(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error posting to TikTok:', error);
      Alert.alert('Error', 'Failed to post to TikTok. Please try again.');
    }
  };

  const renderMediaPreview = () => {
    if (selectedMedia.length === 0) return null;

    const media = selectedMedia[0];
    return (
      <View style={styles.mediaPreviewContainer}>
        <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
        <TouchableOpacity style={styles.removeMediaButton} onPress={removeMedia}>
          <Text style={styles.removeMediaButtonText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.mediaTypeText}>
          {media.type === 'video' ? '🎥' : '📷'}
        </Text>
      </View>
    );
  };

  const renderUploadProgress = () => {
    if (!isUploading) return null;

    return (
      <View style={styles.uploadProgressContainer}>
        <Text style={styles.uploadProgressText}>{currentStep}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
        </View>
        <Text style={styles.progressPercentage}>{uploadProgress}%</Text>
      </View>
    );
  };

  // if (!isAuthenticated) {
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.notConnectedText}>
  //         Connect your TikTok account to post content
  //       </Text>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post to TikTok</Text>
      <Text style={styles.subtitle}>
        Share your check-in experience with your TikTok followers
      </Text>

      {/* Media Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Video</Text>
        <Text style={styles.sectionSubtitle}>
          Choose a video to upload to TikTok (max 60 seconds)
        </Text>

        {renderMediaPreview()}

        <View style={styles.mediaButtonsContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
            <Text style={styles.mediaButtonText}>📁 Choose Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton} onPress={takeVideo}>
            <Text style={styles.mediaButtonText}>🎥 Record Video</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Caption */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Caption</Text>
        <TextInput
          style={styles.captionInput}
          value={caption}
          onChangeText={setCaption}
          placeholder="Write a caption for your TikTok..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={2200} // TikTok caption limit
        />
        <View style={styles.captionActions}>
          <Text style={styles.characterCount}>{caption.length}/2200</Text>
          <TouchableOpacity style={styles.generateButton} onPress={generateCaption}>
            <Text style={styles.generateButtonText}>Auto-Generate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        <View style={styles.privacyOption}>
          <Text style={styles.privacyLabel}>Privacy Level</Text>
          <View style={styles.privacyButtons}>
            {Object.entries(TIKTOK_PRIVACY_SETTINGS).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.privacyButton,
                  privacyLevel === key && styles.privacyButtonSelected,
                ]}
                onPress={() => setPrivacyLevel(key as keyof typeof TIKTOK_PRIVACY_SETTINGS)}
              >
                <Text
                  style={[
                    styles.privacyButtonText,
                    privacyLevel === key && styles.privacyButtonTextSelected,
                  ]}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.switchOption}>
          <Text style={styles.switchLabel}>Disable Comments</Text>
          <Switch
            value={disableComments}
            onValueChange={setDisableComments}
            trackColor={{ false: '#E1E5E9', true: '#FF0050' }}
            thumbColor={disableComments ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchOption}>
          <Text style={styles.switchLabel}>Disable Duet</Text>
          <Switch
            value={disableDuet}
            onValueChange={setDisableDuet}
            trackColor={{ false: '#E1E5E9', true: '#FF0050' }}
            thumbColor={disableDuet ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchOption}>
          <Text style={styles.switchLabel}>Disable Stitch</Text>
          <Switch
            value={disableStitch}
            onValueChange={setDisableStitch}
            trackColor={{ false: '#E1E5E9', true: '#FF0050' }}
            thumbColor={disableStitch ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Upload Progress */}
      {renderUploadProgress()}

      {/* Post Button */}
      {/* <TouchableOpacity
        style={[
          styles.postButton,
          (selectedMedia.length === 0 || isUploading) && styles.postButtonDisabled,
        ]}
        onPress={handlePostToTikTok}
        disabled={selectedMedia.length === 0 || isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.postButtonText}>Post to TikTok</Text>
        )}
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  notConnectedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  mediaPreviewContainer: {
    position: 'relative',
    marginBottom: 12,
    alignSelf: 'center',
  },
  mediaPreview: {
    width: 120,
    height: 160,
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
  mediaButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mediaButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFBFC',
    height: 100,
    textAlignVertical: 'top',
  },
  captionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
  },
  generateButton: {
    backgroundColor: '#FF0050',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  privacyOption: {
    marginBottom: 16,
  },
  privacyLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  privacyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  privacyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    backgroundColor: '#FAFBFC',
  },
  privacyButtonSelected: {
    backgroundColor: '#FF0050',
    borderColor: '#FF0050',
  },
  privacyButtonText: {
    fontSize: 12,
    color: '#666',
  },
  privacyButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  switchOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  uploadProgressContainer: {
    marginBottom: 20,
  },
  uploadProgressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E1E5E9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF0050',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  postButton: {
    backgroundColor: '#FF0050',
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
  postButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 