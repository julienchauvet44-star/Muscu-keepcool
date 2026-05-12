import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import SessionsScreen from '../screens/SessionsScreen';
import CableQuadScreen from '../screens/CableQuadScreen';
import ProgressScreen from '../screens/ProgressScreen';
import NewSessionScreen from '../screens/NewSessionScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function SessionsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textWhite,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="SessionsList"
        component={SessionsScreen}
        options={{ title: 'Mes Séances', headerShown: false }}
      />
      <Stack.Screen
        name="NewSession"
        component={NewSessionScreen}
        options={{
          title: 'Nouvelle Séance',
          headerStyle: { backgroundColor: colors.cardBackground },
          headerTintColor: colors.primary,
        }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{
          title: 'Détail Séance',
          headerStyle: { backgroundColor: colors.cardBackground },
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textWhite,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewSession"
        component={NewSessionScreen}
        options={{
          title: 'Nouvelle Séance',
          headerStyle: { backgroundColor: colors.cardBackground },
          headerTintColor: colors.primary,
        }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{
          title: 'Détail Séance',
          headerStyle: { backgroundColor: colors.cardBackground },
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}

function CableStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textWhite,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="CableMain"
        component={CableQuadScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewSession"
        component={NewSessionScreen}
        options={{
          title: 'Nouvelle Séance',
          headerStyle: { backgroundColor: colors.cardBackground },
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Séances') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'CABLEQUAD') {
            iconName = focused ? 'flash' : 'flash-outline';
          } else if (route.name === 'Progrès') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          }
          return (
            <View style={focused ? styles.activeIconWrap : null}>
              <Ionicons name={iconName} size={focused ? 22 : 22} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accueil" component={HomeStack} />
      <Tab.Screen name="Séances" component={SessionsStack} />
      <Tab.Screen
        name="CABLEQUAD"
        component={CableStack}
        options={{
          tabBarLabel: 'Cable',
          tabBarActiveTintColor: colors.secondary,
          tabBarIcon: ({ focused, color, size }) => (
            <View style={focused ? [styles.activeIconWrap, styles.activeIconOrange] : null}>
              <Ionicons
                name={focused ? 'barbell' : 'barbell-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen name="Progrès" component={ProgressScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  activeIconWrap: {
    backgroundColor: 'rgba(79,195,247,0.15)',
    borderRadius: 10,
    padding: 4,
    marginBottom: -2,
  },
  activeIconOrange: {
    backgroundColor: 'rgba(255,107,53,0.15)',
  },
});
