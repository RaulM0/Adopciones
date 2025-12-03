// screens/AdminAddCenter.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminAddCenter({ navigation }) {
  const [form, setForm] = useState({ name: '', address: '', latitude: '', longitude: '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.address || !form.latitude || !form.longitude) {
      return Alert.alert('Error', 'Todos los campos son obligatorios');
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'centers'), {
        ...form,
        // Convertimos lat/long a números para que el Mapa funcione bien
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        petsCount: 0
      });
      Alert.alert('Éxito', 'Centro agregado correctamente');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrar Centro</Text>

      <Text style={styles.label}>Nombre del Centro</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="Ej: Refugio Patitas" />
      
      <Text style={styles.label}>Dirección</Text>
      <TextInput style={styles.input} value={form.address} onChangeText={t => setForm({...form, address: t})} placeholder="Ej: Av. Reforma 123" />
      
      <Text style={styles.label}>Latitud</Text>
      <TextInput style={styles.input} value={form.latitude} keyboardType="numeric" onChangeText={t => setForm({...form, latitude: t})} placeholder="Ej: 19.4326" />
      
      <Text style={styles.label}>Longitud</Text>
      <TextInput style={styles.input} value={form.longitude} keyboardType="numeric" onChangeText={t => setForm({...form, longitude: t})} placeholder="Ej: -99.1332" />

      <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleSave} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Guardando...' : 'Guardar Centro'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#FF6B6B' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: '600', color: '#333' },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: '#FF6B6B', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  disabled: { opacity: 0.6 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});