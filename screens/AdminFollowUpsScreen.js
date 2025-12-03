// screens/AdminFollowUpsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, Image, ActivityIndicator, Alert 
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminFollowUpsScreen() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Buscar adopciones aprobadas que tengan seguimientos
      const q = query(collection(db, 'adoptions'), where('status', '==', 'approved'));
      const snap = await getDocs(q);
      
      let allFollowUps = [];
      
      snap.forEach(doc => {
        const data = doc.data();
        if (data.followUps && data.followUps.length > 0) {
          // Extraemos cada foto y le agregamos datos del dueño y mascota
          data.followUps.forEach(photo => {
            allFollowUps.push({
              id: Math.random().toString(), // ID temporal para la lista
              petName: data.petName,
              ownerName: data.fullName,
              ...photo
            });
          });
        }
      });

      // Ordenar por fecha (más reciente primero)
      allFollowUps.sort((a, b) => new Date(b.date) - new Date(a.date));
      setFollowUps(allFollowUps);

    } catch (e) {
      Alert.alert('Error', 'No se cargaron los seguimientos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#9C27B0" /></View>;

  return (
    <View style={styles.container}>
      <FlatList 
        data={followUps}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No hay fotos de seguimiento aún.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.petName}>🐾 {item.petName}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.owner}>Dueño: {item.ownerName}</Text>
            
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
            
            <Text style={styles.note}>{item.note || 'Sin notas'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  petName: { fontSize: 18, fontWeight: 'bold', color: '#9C27B0' },
  date: { fontSize: 12, color: '#888' },
  owner: { fontSize: 14, color: '#555', marginBottom: 10 },
  image: { width: '100%', height: 250, borderRadius: 10, marginBottom: 10, backgroundColor: '#eee' },
  note: { fontStyle: 'italic', color: '#666' }
});