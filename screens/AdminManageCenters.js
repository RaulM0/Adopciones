import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function AdminManageCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCenters(); }, []);

  const loadCenters = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'centers'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCenters(list);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los centros');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      'Eliminar Centro',
      `¿Eliminar "${name}"? Se recomienda eliminar primero las mascotas asociadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'centers', id));
              Alert.alert('Éxito', 'Centro eliminado');
              loadCenters();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#2196F3" /></View>;

  return (
    <View style={styles.container}>
      <FlatList 
        data={centers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBg}>
                <Ionicons name="business" size={24} color="#2196F3" />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
              <Ionicons name="trash" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { flexDirection: 'row', backgroundColor: 'white', marginBottom: 10, borderRadius: 12, padding: 15, alignItems: 'center', elevation: 2 },
  iconBg: { backgroundColor: '#E3F2FD', padding: 10, borderRadius: 8, marginRight: 15 },
  info: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  address: { fontSize: 12, color: '#666' },
  deleteBtn: { padding: 10 }
});