// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Screens/Home';
import Notes from './Screens/Notes';
import Camera from './Screens/Camera';
import { FileManagerContextProvider } from './FileManagerContext';

export type RootStackParamsList = {
  Home: undefined;
  Notes: undefined;
  Camera: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamsList>();

const App = () => {
  return (
    <FileManagerContextProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Notes" component={Notes} />
          <Stack.Screen name="Camera" component={Camera} />
        </Stack.Navigator>
      </NavigationContainer>
    </FileManagerContextProvider>
  );
};

export default App;