// screens/AdoptionScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Asegúrate que la ruta sea correcta
import { AuthContext } from '../context/AuthContext'; // Asegúrate que la ruta sea correcta

export default function AdoptionScreen({ route, navigation }) {
  const { pet } = route.params;
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    occupation: '',
    hasOtherPets: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validar campos
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.reason
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'adoptions'), {
        ...formData,
        petId: pet.id,
        petName: pet.name,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        '¡Solicitud Enviada!',
        'Tu solicitud de adopción ha sido enviada exitosamente. El refugio se pondrá en contacto contigo pronto.',
        [
          {
            text: 'OK',
            // --- CORRECCIÓN FINAL ---
            // Usamos popToTop() porque 'Adoption' está en el mismo Stack que 'Main'.
            // Esto te regresa a la pantalla principal ('Main') de forma segura.
            onPress: () => navigation.popToTop(), 
          },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Solicitud de Adopción</Text>
          <Text style={styles.petName}>Para: {pet.name}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>
            Nombre Completo <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
            placeholder="Tu nombre completo"
          />

          <Text style={styles.label}>
            Teléfono <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Tu número de teléfono"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>
            Dirección <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Tu dirección completa"
          />

          <Text style={styles.label}>Ocupación</Text>
          <TextInput
            style={styles.input}
            value={formData.occupation}
            onChangeText={(text) =>
              setFormData({ ...formData, occupation: text })
            }
            placeholder="Tu ocupación"
          />

          <Text style={styles.label}>¿Tienes otras mascotas?</Text>
          <TextInput
            style={styles.input}
            value={formData.hasOtherPets}
            onChangeText={(text) =>
              setFormData({ ...formData, hasOtherPets: text })
            }
            placeholder="Sí/No, especifica cuáles"
          />

          <Text style={styles.label}>
            ¿Por qué quieres adoptar a {pet.name}?{' '}
            <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.reason}
            onChangeText={(text) => setFormData({ ...formData, reason: text })}
            placeholder="Cuéntanos por qué quieres adoptar..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  petName: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  required: {
    color: '#FF6B6B',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});