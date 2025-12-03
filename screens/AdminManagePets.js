import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator 
} from 'react-native';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // IMPORTANTE para recargar al volver

export default function AdminManagePets({ navigation }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recargar la lista cada vez que la pantalla obtiene el foco (al volver de editar)
  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );

  const loadPets = async () => {
    // No ponemos setLoading(true) aquí para evitar parpadeos molestos al volver
    try {
      const snap = await getDocs(collection(db, 'pets'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPets(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      'Eliminar Mascota',
      `¿Estás seguro de eliminar a ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'pets', id));
              loadPets(); // Recargamos la lista tras borrar
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (pet) => {
    // CONEXIÓN CLAVE: Enviamos la mascota completa a la pantalla de agregar/editar
    navigation.navigate('AdminAddPet', { petToEdit: pet });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#FF6B6B" /></View>;

  return (
    <View style={styles.container}>
      <FlatList 
        data={pets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image 
              source={{ uri: item.image || 'https://via.placeholder.com/100' }} 
              style={styles.image} 
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>{item.breed}</Text>
              <Text style={[styles.status, { color: item.available ? 'green' : 'red' }]}>
                 {item.available ? 'Disponible' : 'Adoptado'}
              </Text>
            </View>
            
            <View style={styles.actions}>
              {/* Botón Editar - Llama a handleEdit */}
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
                <Ionicons name="pencil" size={24} color="#2196F3" />
              </TouchableOpacity>
              
              {/* Botón Eliminar */}
              <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionBtn}>
                <Ionicons name="trash" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    marginBottom: 10, 
    borderRadius: 12, 
    padding: 10, 
    alignItems: 'center', 
    elevation: 2 
  },
  image: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 15 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  detail: { fontSize: 14, color: '#666' },
  status: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 10 }
});