/**
 * @format
 */
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['The app is running using the Legacy Architecture']);
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';


AppRegistry.registerComponent(appName, () => App);
