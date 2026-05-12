import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { WorkoutProvider } from './src/context/WorkoutContext';
import AppNavigator from './src/navigation/AppNavigator';
import colors from './src/theme/colors';

const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.tabBar,
    text: colors.textWhite,
    border: colors.tabBarBorder,
    notification: colors.secondary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <WorkoutProvider>
        <NavigationContainer theme={navigationTheme}>
          <AppNavigator />
        </NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.background} />
      </WorkoutProvider>
    </SafeAreaProvider>
  );
}
