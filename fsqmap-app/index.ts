// @ts-ignore - Missing type declarations for @ungap/structured-clone
import structuredClone from '@ungap/structured-clone';
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  console.log('Setting up polyfills');
  const setupPolyfills = async () => {
    const { polyfillGlobal } = await import(
      // @ts-ignore - Missing type declarations for react-native/Libraries/Utilities/PolyfillFunctions
      'react-native/Libraries/Utilities/PolyfillFunctions'
    );

    const { TextEncoderStream, TextDecoderStream } = await import(
      '@stardazed/streams-text-encoding'
    );

    if (!('structuredClone' in global)) {
      polyfillGlobal('structuredClone', () => structuredClone);
    }

    polyfillGlobal('TextEncoderStream', () => TextEncoderStream);
    polyfillGlobal('TextDecoderStream', () => TextDecoderStream);
  };

  setupPolyfills();
}
