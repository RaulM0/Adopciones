import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function HomeScreen({ navigation }) {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [region, setRegion] = useState({
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const centersSnapshot = await getDocs(collection(db, 'centers'));
      const centersData = centersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCenters(centersData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los centros de adopción');
    }
  };

  const handleCenterPress = (center) => {
    setSelectedCenter(center);
    navigation.navigate('Center', { center });
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
            description={center.address}
            onPress={() => handleCenterPress(center)}
          />
        ))}
      </MapView>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Centros de Adopción</Text>
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
                {item.petsCount || 0} mascotas disponibles
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
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
  },
});