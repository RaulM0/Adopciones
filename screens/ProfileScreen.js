import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  arrayUnion 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

// Importamos storage también. Asegúrate de que la ruta a firebaseConfig sea correcta
import { auth, db, storage } from '../firebaseConfig'; 
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [adoptions, setAdoptions] = useState([]);
  const [loadingAdoptions, setLoadingAdoptions] = useState(true);
  
  // Estados para la subida de imagen
  const [uploading, setUploading] = useState(false);
  const [selectedAdoptionId, setSelectedAdoptionId] = useState(null);

  useEffect(() => {
    loadUserData();
    loadUserAdoptions();
  }, []);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      setUserData(userDoc.data());
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // --- LÓGICA DE ADOPCIONES ---
  const loadUserAdoptions = async () => {
    if (!user) return;
    try {
      // Buscamos en la colección 'adoptions' donde el userId sea el mío
      const q = query(
        collection(db, 'adoptions'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const adoptionsList = [];
      
      querySnapshot.forEach((doc) => {
        adoptionsList.push({ id: doc.id, ...doc.data() });
      });

      // Ordenar: Las más recientes primero
      adoptionsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setAdoptions(adoptionsList);
    } catch (error) {
      console.error('Error cargando adopciones:', error);
      Alert.alert('Error', 'No se pudieron cargar tus adopciones.');
    } finally {
      setLoadingAdoptions(false);
    }
  };

  // --- LÓGICA DE SUBIDA DE IMAGEN ---
  const handleAddFollowUp = async (adoptionId) => {
    // 1. Pedir permisos para acceder a la galería
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permiso requerido", "Necesitas dar acceso a la galería para subir fotos de seguimiento.");
      return;
    }

    // 2. Abrir la galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Calidad media para que suba rápido
    });

    if (!result.canceled) {
      uploadFollowUpImage(result.assets[0].uri, adoptionId);
    }
  };

  const uploadFollowUpImage = async (uri, adoptionId) => {
    setUploading(true);
    setSelectedAdoptionId(adoptionId);
    
    try {
      // 1. Preparar el archivo para subir
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // 2. Crear nombre único para la foto
      const filename = `followup_${Date.now()}.jpg`;
      // Ruta en Firebase Storage: seguimientos/ID_ADOPCION/nombre_foto.jpg
      const storageRef = ref(storage, `followups/${adoptionId}/${filename}`);
      
      // 3. Subir la imagen a la nube
      await uploadBytes(storageRef, blob);
      
      // 4. Obtener el link de descarga público
      const downloadURL = await getDownloadURL(storageRef);
      
      // 5. Guardar ese link en la base de datos (Firestore)
      const adoptionRef = doc(db, 'adoptions', adoptionId);
      
      const newFollowUp = {
        date: new Date().toISOString(),
        imageUrl: downloadURL,
        note: 'Seguimiento mensual'
      };

      // Usamos arrayUnion para añadirlo a la lista existente sin borrar lo anterior
      await updateDoc(adoptionRef, {
        followUps: arrayUnion(newFollowUp)
      });

      Alert.alert("¡Excelente!", "Tu foto de seguimiento se ha subido correctamente.");
      
      // Recargar la lista para ver la foto nueva
      loadUserAdoptions();

    } catch (error) {
      console.error("Error subiendo seguimiento:", error);
      Alert.alert("Error", "Ocurrió un problema al subir la imagen. Intenta de nuevo.");
    } finally {
      setUploading(false);
      setSelectedAdoptionId(null);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  // Función auxiliar para colores de estado
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#4CAF50'; // Verde
      case 'rejected': return '#F44336'; // Rojo
      default: return '#FF9800'; // Naranja (Pending)
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return 'Pendiente';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#FF6B6B" />
        </View>
        <Text style={styles.name}>{userData?.name || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* INFORMACIÓN CUENTA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Cuenta</Text>

        <View style={styles.infoCard}>
          <Ionicons name="mail" size={24} color="#FF6B6B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="calendar" size={24} color="#FF6B6B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Miembro desde</Text>
            <Text style={styles.infoValue}>
              {userData?.registrationDate
                ? new Date(userData.registrationDate).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Cargando...'}
            </Text>
          </View>
        </View>
      </View>

      {/* SECCIÓN DE ADOPCIONES Y SEGUIMIENTO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Adopciones</Text>

        {loadingAdoptions ? (
          <ActivityIndicator size="small" color="#FF6B6B" style={{margin: 20}} />
        ) : adoptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>Aún no has solicitado adopciones.</Text>
          </View>
        ) : (
          adoptions.map((adoption) => (
            <View key={adoption.id} style={styles.adoptionCard}>
              
              {/* Encabezado de la tarjeta */}
              <View style={styles.adoptionHeader}>
                <View>
                    <Text style={styles.petNameTitle}>{adoption.petName}</Text>
                    <Text style={styles.adoptionDate}>
                        Solicitado el {new Date(adoption.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(adoption.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(adoption.status)}</Text>
                </View>
              </View>

              {/* Razón de adopción (opcional) */}
              <Text style={styles.adoptionReason} numberOfLines={2}>
                "{adoption.reason}"
              </Text>

              {/* ÁREA DE SEGUIMIENTO */}
              {/* Se muestra si está aprobada o si queremos probar (elimina el "|| true" en producción) */}
              {adoption.status === 'approved' || true ? ( 
                <View style={styles.followUpContainer}>
                  <View style={styles.followUpHeader}>
                    <Text style={styles.followUpTitle}>📸 Seguimiento Mensual</Text>
                    <Text style={styles.followUpCount}>
                       {adoption.followUps ? adoption.followUps.length : 0} fotos
                    </Text>
                  </View>
                  
                  {/* Botón de subir */}
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={() => handleAddFollowUp(adoption.id)}
                    disabled={uploading}
                  >
                    {uploading && selectedAdoptionId === adoption.id ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Ionicons name="add-circle" size={20} color="white" />
                            <Text style={styles.uploadButtonText}>Subir Nueva Foto</Text>
                        </>
                    )}
                  </TouchableOpacity>

                  {/* Galería de fotos subidas */}
                  {adoption.followUps && adoption.followUps.length > 0 && (
                      <ScrollView horizontal style={styles.photosScroll} showsHorizontalScrollIndicator={false}>
                          {adoption.followUps.map((pic, index) => (
                              <View key={index} style={styles.photoWrapper}>
                                <Image 
                                  source={{ uri: pic.imageUrl }} 
                                  style={styles.thumbnail} 
                                />
                                <Text style={styles.photoDate}>
                                  {new Date(pic.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                </Text>
                              </View>
                          ))}
                      </ScrollView>
                  )}
                </View>
              ) : null}
            </View>
          ))
        )}
      </View>

      {/* CONFIGURACIÓN Y SALIDA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications" size={24} color="#666" />
          <Text style={styles.menuText}>Notificaciones</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark" size={24} color="#666" />
          <Text style={styles.menuText}>Privacidad</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color="white" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Versión 1.1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: { marginBottom: 15 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  email: { fontSize: 14, color: '#666' },
  section: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
  },
  infoContent: { marginLeft: 15, flex: 1 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 3 },
  infoValue: { fontSize: 16, color: '#333', fontWeight: '600' },
  
  // --- ESTILOS DE ADOPCIONES ---
  adoptionCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adoptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  petNameTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
  },
  adoptionDate: {
      fontSize: 12,
      color: '#999',
      marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  adoptionReason: {
      fontSize: 14,
      color: '#666',
      fontStyle: 'italic',
      marginBottom: 15,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
  },
  
  // Seguimiento
  followUpContainer: {
      marginTop: 5,
  },
  followUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  followUpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  followUpCount: {
    fontSize: 12,
    color: '#999',
  },
  uploadButton: {
      backgroundColor: '#FF6B6B',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
      marginBottom: 15,
  },
  uploadButtonText: {
      color: 'white',
      fontWeight: '600',
      marginLeft: 8,
      fontSize: 14,
  },
  photosScroll: {
      flexDirection: 'row',
  },
  photoWrapper: {
    marginRight: 10,
    alignItems: 'center',
  },
  thumbnail: {
      width: 70,
      height: 70,
      borderRadius: 8,
      backgroundColor: '#f0f0f0',
      borderWidth: 1,
      borderColor: '#eee',
  },
  photoDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },

  // Menú General
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: { flex: 1, fontSize: 16, color: '#333', marginLeft: 15 },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    margin: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  version: { textAlign: 'center', color: '#999', fontSize: 12, marginBottom: 30 },
});