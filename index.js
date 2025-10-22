import 'react-native-gesture-handler';        // ← debe ir antes que cualquier RN import
import { enableScreens } from 'react-native-screens';
enableScreens(true);

import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);