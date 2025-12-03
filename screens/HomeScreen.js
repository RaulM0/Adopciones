import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
// Agregamos 'query' y 'where' para filtrar mascotas
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Importante para recargar al volver

export default function HomeScreen({ navigation }) {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [region, setRegion] = useState({
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Usamos useFocusEffect para que los datos se actualicen cada vez que entras a la pantalla
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      // 1. Obtener Centros
      const centersSnapshot = await getDocs(collection(db, 'centers'));
      let centersData = centersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        petsCount: 0 // Inicializamos en 0
      }));

      // 2. Obtener TODAS las mascotas disponibles (available == true)
      // Esto es necesario para hacer el conteo real sin depender de un campo fijo en el centro
      const petsQuery = query(collection(db, 'pets'), where('available', '==', true));
      const petsSnapshot = await getDocs(petsQuery);

      // 3. Calcular el conteo por centro
      const counts = {};
      petsSnapshot.forEach(doc => {
        const pet = doc.data();
        if (pet.centerId) {
          counts[pet.centerId] = (counts[pet.centerId] || 0) + 1;
        }
      });

      // 4. Asignar el conteo real a cada centro
      centersData = centersData.map(center => ({
        ...center,
        petsCount: counts[center.id] || 0
      }));

      setCenters(centersData);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const handleCenterPress = (center) => {
    setSelectedCenter(center);
    navigation.navigate('Center', { center });
  };

  const openUnityApp = async () => {
    const UNITY_PACKAGE_NAME = 'com.unity.template.ar_mobile';
    
    try {
      const mainIntent = `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${UNITY_PACKAGE_NAME};end`;
      const canOpenMain = await Linking.canOpenURL(mainIntent);
      
      if (canOpenMain) {
        await Linking.openURL(mainIntent);
        return;
      }

      const simpleIntent = `intent://#Intent;package=${UNITY_PACKAGE_NAME};end`;
      const canOpenSimple = await Linking.canOpenURL(simpleIntent);
      
      if (canOpenSimple) {
        await Linking.openURL(simpleIntent);
        return;
      }

      const appScheme = `android-app://${UNITY_PACKAGE_NAME}`;
      const canOpenScheme = await Linking.canOpenURL(appScheme);
      
      if (canOpenScheme) {
        await Linking.openURL(appScheme);
        return;
      }

      Alert.alert(
        'No se pudo abrir la app',
        'La aplicación Unity no se puede abrir automáticamente.\n\n' +
        '¿Qué puedes hacer?\n' +
        '• Abre manualmente la app "adopciones"\n' +
        '• Verifica que esté instalada\n' +
        '• Presiona el botón 🐛 para diagnóstico',
        [
          { 
            text: 'Ver en Play Store', 
            onPress: () => {
              const playStoreUrl = `market://details?id=${UNITY_PACKAGE_NAME}`;
              Linking.openURL(playStoreUrl).catch(() => {
                Linking.openURL(`https://play.google.com/store/apps/details?id=${UNITY_PACKAGE_NAME}`);
              });
            }
          },
          { text: 'Cerrar' }
        ]
      );

    } catch (error) {
      Alert.alert(
        'Error',
        `Error al intentar abrir: ${error.message}\n\nPackage: ${UNITY_PACKAGE_NAME}`,
        [{ text: 'OK' }]
      );
      console.error('Error opening Unity app:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        {centers.map((center) => (
          <Marker
            key={center.id}
            coordinate={{
              latitude: center.latitude,
              longitude: center.longitude,
            }}
            title={center.name}
            description={`${center.petsCount} mascotas disponibles`} // Mostramos el conteo aquí también
            onPress={() => handleCenterPress(center)}
          />
        ))}
      </MapView>

      <View style={styles.listContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.listTitle}>Centros de Adopción</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.unityButton} onPress={openUnityApp}>
              <Ionicons name="cube" size={20} color="white" />
              <Text style={styles.unityButtonText}>Conocer más</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          data={centers}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.centerCard}
              onPress={() => handleCenterPress(item)}
            >
              <Text style={styles.centerName}>{item.name}</Text>
              <Text style={styles.centerAddress}>{item.address}</Text>
              <Text style={styles.centerPets}>
                {item.petsCount} {item.petsCount === 1 ? 'mascota disponible' : 'mascotas disponibles'}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  listContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unityButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 5,
  },
  unityButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  centerCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    width: 200,
    borderWidth: 1,
    borderColor: '#eee',
  },
  centerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FF6B6B',
  },
  centerAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  centerPets: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600'
  },
});