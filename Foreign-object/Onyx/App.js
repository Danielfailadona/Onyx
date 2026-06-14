import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { StoreProvider }         from './src/hooks/useStore';
import { colors }                from './src/utils/theme';

// Auth screens
import LoginScreen  from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

// App screens
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import CompaniesScreen   from './src/screens/CompaniesScreen';
import MyCompanyScreen   from './src/screens/MyCompanyScreen';
import {
  DishDetailScreen,
  StoreDetailScreen,
  CartScreen,
  EditItemScreen,
} from './src/screens/OtherScreens';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const NAV_OPTS = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.obsidian },
  animation: 'slide_from_right',
};

// ── Tab icons ──
const TAB_ICONS = {
  Marketplace: { icon: '◈', label: 'Market' },
  Companies:   { icon: '⊞', label: 'Stores' },
  MyCompany:   { icon: '⊕', label: 'My Shop' },
};

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.charcoal,
          borderTopColor:  colors.goldLine,
          borderTopWidth:  1,
          height:          68,
          paddingBottom:   12,
          paddingTop:      8,
        },
        tabBarActiveTintColor:   colors.gold,
        tabBarInactiveTintColor: colors.dim,
        tabBarLabelStyle: {
          fontSize:      9,
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontWeight:    '600',
          marginTop:     2,
        },
        tabBarIcon: ({ focused, color }) => {
          const info = TAB_ICONS[route.name];
          return (
            <Text style={{ color, fontSize: focused ? 22 : 18 }}>
              {info?.icon || '·'}
            </Text>
          );
        },
        tabBarLabel: TAB_ICONS[route.name]?.label || route.name,
      })}>
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Companies"   component={CompaniesScreen}   />
      <Tab.Screen name="MyCompany"   component={MyCompanyScreen}   />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={NAV_OPTS}>
      <Stack.Screen name="AppTabs"    component={AppTabs}          />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
      <Stack.Screen name="StoreDetail"component={StoreDetailScreen}/>
      <Stack.Screen name="Cart"       component={CartScreen}       />
      <Stack.Screen name="EditItem"   component={EditItemScreen}   />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...NAV_OPTS, animation: 'fade' }}>
      <Stack.Screen name="Login"  component={LoginScreen}  />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// ── Root: gate by auth session ──
function RootNavigator() {
  const { session, authReady } = useAuth();

  if (!authReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.obsidian, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.gold, fontSize: 32, fontWeight: '800', letterSpacing: 8, marginBottom: 24 }}>
          ONY<Text style={{ color: colors.white }}>X</Text>
        </Text>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <RootNavigator />
      </StoreProvider>
    </AuthProvider>
  );
}
