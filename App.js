import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// --- SCREENS NORMALES ---
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import CenterScreen from './screens/CenterScreen';
import PetDetailScreen from './screens/PetDetailScreen';
import AdoptionScreen from './screens/AdoptionScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';

// --- SCREENS ADMIN ---
import AdminScreen from './screens/AdminScreen';
import AdminAddCenter from './screens/AdminAddCenter';
import AdminAddPet from './screens/AdminAddPet';
import AdminRequestsScreen from './screens/AdminRequestsScreen';
// Nuevas importaciones:
import AdminManagePets from './screens/AdminManagePets';
import AdminManageCenters from './screens/AdminManageCenters'; // Asegúrate de crear este archivo
import AdminFollowUpsScreen from './screens/AdminFollowUpsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AdminStack = createNativeStackNavigator();

// Navegación de pestañas para usuarios normales
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'FavoritesTab') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Explorar' }} />
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} options={{ tabBarLabel: 'Favoritos' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}

// Navegador exclusivo para Admin
function AdminNavigator() {
  return (
    <AdminStack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#FF6B6B' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false
      }}
    >
      <AdminStack.Screen name="AdminDashboard" component={AdminScreen} options={{ title: 'Administración' }} />
      
      {/* Gestión de Centros */}
      <AdminStack.Screen name="AdminAddCenter" component={AdminAddCenter} options={{ title: 'Nuevo Centro' }} />
      <AdminStack.Screen name="AdminManageCenters" component={AdminManageCenters} options={{ title: 'Gestionar Centros' }} />

      {/* Gestión de Mascotas */}
      <AdminStack.Screen name="AdminAddPet" component={AdminAddPet} options={{ title: 'Nueva Mascota' }} />
      <AdminStack.Screen name="AdminManagePets" component={AdminManagePets} options={{ title: 'Gestionar Mascotas' }} />

      {/* Gestión de Solicitudes y Seguimientos */}
      <AdminStack.Screen name="AdminRequests" component={AdminRequestsScreen} options={{ title: 'Solicitudes' }} />
      <AdminStack.Screen name="AdminFollowUps" component={AdminFollowUpsScreen} options={{ title: 'Galería de Seguimientos' }} />
      
    </AdminStack.Navigator>
  );
}

function AppNavigator() {
  const { user, userData, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : userData?.role === 'admin' ? (
        <AdminNavigator />
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen 
            name="Center" 
            component={CenterScreen} 
            options={({ route }) => ({
              title: route.params?.center?.name || 'Centro',
              headerStyle: { backgroundColor: '#FF6B6B' },
              headerTintColor: '#fff',
            })}
          />
          <Stack.Screen 
            name="PetDetail" 
            component={PetDetailScreen} 
            options={{ title: 'Detalle', headerStyle: { backgroundColor: '#FF6B6B' }, headerTintColor: '#fff' }}
          />
          <Stack.Screen 
            name="Adoption" 
            component={AdoptionScreen} 
            options={{ title: 'Adopción', headerStyle: { backgroundColor: '#FF6B6B' }, headerTintColor: '#fff' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}