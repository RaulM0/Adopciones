// screens/AdminScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function AdminScreen({ navigation }) {

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive", 
          onPress: async () => {
            try { await signOut(auth); } catch (error) { Alert.alert("Error", error.message); }
          } 
        }
      ]
    );
  };

  const menuItems = [
    {
      title: "Nuevo Centro",
      subtitle: "Registrar ubicación",
      icon: "business",
      color: "#2196F3",
      bg: "#E3F2FD",
      route: "AdminAddCenter"
    },
    {
      title: "Admin. Centros",
      subtitle: "Editar/Eliminar",
      icon: "list",
      color: "#1976D2", // Azul más oscuro
      bg: "#BBDEFB",
      route: "AdminManageCenters" // <--- NUEVA RUTA (Crea este archivo similar a ManagePets)
    },
    {
      title: "Nueva Mascota",
      subtitle: "Añadir al catálogo",
      icon: "paw",
      color: "#4CAF50",
      bg: "#E8F5E9",
      route: "AdminAddPet"
    },
    {
      title: "Admin. Mascotas",
      subtitle: "Editar/Eliminar",
      icon: "list-circle",
      color: "#388E3C", // Verde más oscuro
      bg: "#C8E6C9",
      route: "AdminManagePets" // <--- NUEVA RUTA
    },
    {
      title: "Solicitudes",
      subtitle: "Aprobar adopciones",
      icon: "documents",
      color: "#FF9800",
      bg: "#FFF3E0",
      route: "AdminRequests"
    },
    {
      title: "Seguimientos",
      subtitle: "Ver fotos de usuarios",
      icon: "camera",
      color: "#9C27B0",
      bg: "#F3E5F5",
      route: "AdminFollowUps" // <--- NUEVA RUTA
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Panel de Control</Text>
          <Text style={styles.headerSubtitle}>Administración del sistema</Text>
        </View>
        
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.card} 
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBg, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.cardText}>{item.title}</Text>
              <Text style={styles.cardSubtext}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Admin Mode v1.2</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 25, marginTop: 10 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#333' },
  headerSubtitle: { fontSize: 16, color: '#888', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    backgroundColor: 'white',
    width: '48%', 
    padding: 15,
    borderRadius: 20,
    alignItems: 'flex-start',
    marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  iconBg: { padding: 10, borderRadius: 12, marginBottom: 12 },
  cardText: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 2 },
  cardSubtext: { fontSize: 11, color: '#999', fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F0F0F0', alignItems: 'center' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30, backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FFE5E5', width: '100%' },
  logoutText: { color: '#FF6B6B', fontWeight: '700', fontSize: 16, marginLeft: 10 },
  versionText: { marginTop: 15, fontSize: 11, color: '#CCC' }
});