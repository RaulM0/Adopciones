import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Modal, 
  FlatList 
} from 'react-native';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons'; // Importamos iconos para la flechita

export default function AdminAddPet({ navigation, route }) {
  const petToEdit = route.params?.petToEdit;
  const isEditing = !!petToEdit;

  const [centers, setCenters] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar el menú desplegable

  const [form, setForm] = useState({
    name: '', 
    age: '', 
    breed: '', 
    gender: '', 
    size: '', 
    energy: '', 
    health: '', 
    description: '', 
    centerId: '', 
    image: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCenters();
    
    if (isEditing) {
      setForm({
        name: petToEdit.name || '',
        age: petToEdit.age || '',
        breed: petToEdit.breed || '',
        gender: petToEdit.gender || '',
        size: petToEdit.size || '',
        energy: petToEdit.energy || '',
        health: petToEdit.health || '',
        description: petToEdit.description || '',
        centerId: petToEdit.centerId || '',
        image: petToEdit.image || ''
      });
      navigation.setOptions({ title: 'Editar Mascota' });
    }
  }, [petToEdit]);

  const loadCenters = async () => {
    try {
      const snap = await getDocs(collection(db, 'centers'));
      setCenters(snap.docs.map(d => ({id: d.id, name: d.data().name})));
    } catch (e) {
      console.error("Error cargando centros", e);
    }
  };

  const handleSave = async () => {
    if(!form.name || !form.centerId) return Alert.alert('Error', 'Nombre y Centro son obligatorios');

    setLoading(true);
    try {
      if (isEditing) {
        const petRef = doc(db, 'pets', petToEdit.id);
        await updateDoc(petRef, { ...form });
        Alert.alert('Actualizado', 'Los datos de la mascota han sido actualizados');
      } else {
        await addDoc(collection(db, 'pets'), {
          ...form,
          available: true, 
          createdAt: new Date().toISOString()
        });
        Alert.alert('Éxito', 'Mascota agregada al catálogo');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper para mostrar el nombre del centro seleccionado
  const selectedCenterName = centers.find(c => c.id === form.centerId)?.name;

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{isEditing ? 'Editar Mascota' : 'Nueva Mascota'}</Text>

        {/* --- MENU DESPLEGABLE PARA CENTRO --- */}
        <Text style={styles.label}>Centro de Adopción</Text>
        <TouchableOpacity 
          style={styles.dropdownSelector} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.dropdownText, !form.centerId && { color: '#aaa' }]}>
            {selectedCenterName || "Selecciona un centro..."}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
        {/* ------------------------------------ */}

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} />

        <Text style={styles.label}>Raza</Text>
        <TextInput style={styles.input} value={form.breed} onChangeText={t => setForm({...form, breed: t})} />

        <Text style={styles.label}>Edad</Text>
        <TextInput style={styles.input} value={form.age} onChangeText={t => setForm({...form, age: t})} placeholder="Ej: 5 años" />

        <Text style={styles.label}>Género</Text>
        <TextInput style={styles.input} value={form.gender} onChangeText={t => setForm({...form, gender: t})} placeholder="Macho / Hembra" />

        <Text style={styles.label}>Tamaño</Text>
        <TextInput style={styles.input} value={form.size} onChangeText={t => setForm({...form, size: t})} placeholder="Pequeño / Mediano / Grande" />

        <Text style={styles.label}>Nivel de Energía</Text>
        <TextInput 
          style={styles.input} 
          value={form.energy} 
          onChangeText={t => setForm({...form, energy: t})} 
          placeholder="Ej: Baja / Media / Alta" 
        />

        <Text style={styles.label}>Estado de Salud</Text>
        <TextInput 
          style={styles.input} 
          value={form.health} 
          onChangeText={t => setForm({...form, health: t})} 
          placeholder="Ej: Vacunado, Esterilizado" 
        />

        <Text style={styles.label}>URL Imagen</Text>
        <TextInput style={styles.input} value={form.image} onChangeText={t => setForm({...form, image: t})} placeholder="http://..." />

        <Text style={styles.label}>Descripción</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          value={form.description} 
          onChangeText={t => setForm({...form, description: t})} 
          multiline 
          numberOfLines={4}
        />

        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleSave} disabled={loading}>
          <Text style={styles.btnText}>
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Mascota' : 'Guardar Mascota')}
          </Text>
        </TouchableOpacity>
        <View style={{height: 40}} />
      </ScrollView>

      {/* --- MODAL PARA SELECCIONAR CENTRO --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Elige un Centro</Text>
            
            <FlatList
              data={centers}
              keyExtractor={item => item.id}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setForm({ ...form, centerId: item.id });
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText, 
                    form.centerId === item.id && styles.selectedItemText
                  ]}>
                    {item.name}
                  </Text>
                  {form.centerId === item.id && <Ionicons name="checkmark" size={20} color="#FF6B6B" />}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#FF6B6B' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: '600', color: '#333' },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#FF6B6B', padding: 15, borderRadius: 10, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Estilos del Dropdown
  dropdownSelector: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dropdownText: { fontSize: 16, color: '#333' },

  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalItemText: { fontSize: 16, color: '#333' },
  selectedItemText: { color: '#FF6B6B', fontWeight: 'bold' },
  closeButton: { marginTop: 15, padding: 10, alignItems: 'center' },
  closeButtonText: { color: '#666', fontSize: 16 }
});