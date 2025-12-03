// screens/AdminRequestsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // 1. Buscamos todas las solicitudes con status 'pending'
      const q = query(collection(db, 'adoptions'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleApprove = async (selectedRequest) => {
    Alert.alert(
      'Confirmar Adopción',
      `¿Deseas aprobar la adopción de ${selectedRequest.petName} para ${selectedRequest.fullName}?\n\n⚠️ ESTO ES IRREVERSIBLE:\n1. Esta solicitud será aprobada.\n2. Las demás solicitudes para ${selectedRequest.petName} serán rechazadas automáticamente.\n3. La mascota dejará de aparecer en el catálogo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar Adopción',
          style: 'default',
          onPress: async () => {
            try {
              setLoading(true);
              const batch = writeBatch(db);

              // A. Aprobar la solicitud seleccionada
              const selectedRef = doc(db, 'adoptions', selectedRequest.id);
              batch.update(selectedRef, { status: 'approved' });

              // B. Buscar si hay OTRAS solicitudes pendientes para la misma mascota (petId)
              const otherRequestsQuery = query(
                collection(db, 'adoptions'),
                where('petId', '==', selectedRequest.petId),
                where('status', '==', 'pending')
              );
              const otherSnapshot = await getDocs(otherRequestsQuery);

              // Recorremos las otras solicitudes y las rechazamos en el batch
              otherSnapshot.docs.forEach((requestDoc) => {
                if (requestDoc.id !== selectedRequest.id) {
                  batch.update(requestDoc.ref, { status: 'rejected' });
                }
              });

              // C. Actualizar la mascota para que NO esté disponible (available: false)
              const petRef = doc(db, 'pets', selectedRequest.petId);
              batch.update(petRef, { available: false });

              // D. Ejecutar todo el lote de cambios
              await batch.commit();
              
              Alert.alert('¡Excelente!', 'Adopción procesada correctamente.');
              loadRequests(); // Recargar la lista
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Ocurrió un error al procesar la adopción.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = async (id) => {
      // Rechazo simple individual
      try {
        await updateDoc(doc(db, 'adoptions', id), { status: 'rejected' });
        Alert.alert('Rechazada', 'La solicitud ha sido rechazada.');
        loadRequests();
      } catch (error) {
        Alert.alert('Error', 'No se pudo rechazar la solicitud');
      }
  };

  if (loading) {
    return <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#FF6B6B" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay solicitudes pendientes.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.petName}>🐶 {item.petName}</Text>
                <Text style={styles.date}>Fecha: {new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <Text style={styles.label}>Solicitante:</Text>
                <Text style={styles.value}>{item.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.label}>Motivo:</Text>
                <Text style={styles.value} numberOfLines={2}>{item.reason}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleReject(item.id)}>
                    <Text style={styles.btnText}>Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handleApprove(item)}>
                    <Text style={styles.btnText}>Aprobar Adopción</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
    loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: 'white', padding: 15, marginBottom: 15, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
    petName: { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B' },
    date: { fontSize: 12, color: '#999' },
    infoRow: { flexDirection: 'row', marginBottom: 5 },
    label: { fontWeight: 'bold', color: '#555', width: 80 },
    value: { flex: 1, color: '#333' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, gap: 10 },
    btn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    btnReject: { backgroundColor: '#e0e0e0' },
    btnApprove: { backgroundColor: '#4CAF50' },
    btnText: { color: 'white', fontWeight: 'bold' } // Color negro para reject para contraste, o blanco si el fondo es oscuro. Aquí puse #e0e0e0 así que mejor texto oscuro para reject
});