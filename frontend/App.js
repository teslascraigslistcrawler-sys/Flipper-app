import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LotProvider } from './src/context/LotContext';
import { COLORS } from './src/theme/colors';

import CameraScreen from './src/screens/CameraScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import ResultScreen from './src/screens/ResultScreen';
import LotScreen from './src/screens/LotScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <LotProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Camera"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="Preview" component={PreviewScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="Lot" component={LotScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LotProvider>
    </SafeAreaProvider>
  );
}
