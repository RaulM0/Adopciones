// screens/PetDetailScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function PetDetailScreen({ route, navigation }) {
  const { pet } = route.params;
  const { user } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);

  React.useEffect(() => {
    checkIfFavorite();
  }, []);

  const checkIfFavorite = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setIsFavorite(userData?.favorites?.includes(pet.id) || false);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      if (isFavorite) {
        await updateDoc(userRef, {
          favorites: arrayRemove(pet.id),
        });
        setIsFavorite(false);
        Alert.alert('Eliminado', 'Mascota eliminada de favoritos');
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(pet.id),
        });
        setIsFavorite(true);
        Alert.alert('Agregado', 'Mascota agregada a favoritos');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar favoritos');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image
          source={{ uri: pet.image || 'https://via.placeholder.com/400' }}
          style={styles.image}
        />

        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={30}
            color={isFavorite ? '#FF6B6B' : '#666'}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{pet.name}</Text>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{pet.age}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{pet.gender}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.breed}>{pet.breed}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre {pet.name}</Text>
            <Text style={styles.description}>
              {pet.description || 'Sin descripción disponible'}
            </Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="paw" size={24} color="#FF6B6B" />
              <Text style={styles.infoLabel}>Tamaño</Text>
              <Text style={styles.infoValue}>{pet.size || 'Mediano'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="fitness" size={24} color="#FF6B6B" />
              <Text style={styles.infoLabel}>Energía</Text>
              <Text style={styles.infoValue}>{pet.energy || 'Media'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="heart" size={24} color="#FF6B6B" />
              <Text style={styles.infoLabel}>Salud</Text>
              <Text style={styles.infoValue}>{pet.health || 'Buena'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.adoptButton}
          onPress={() => navigation.navigate('Adoption', { pet })}
        >
          <Text style={styles.adoptButtonText}>Iniciar Adopción</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  tags: {
    flexDirection: 'column',
    gap: 5,
  },
  tag: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  breed: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  adoptButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  adoptButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});