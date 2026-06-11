// MUST be the very first import — gesture handler needs to patch
// the native touch responder before any other module loads
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
