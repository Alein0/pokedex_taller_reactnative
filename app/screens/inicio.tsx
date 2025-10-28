import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { getRegions } from "../utils/api";
export default function Inicio({ onSelectRegion, irAFavoritos }: any) {
  const [regiones, setRegiones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarRegiones = async () => {
      try {
        const data = await getRegions();
        setRegiones(data);
      } catch (error) {
        console.log("Error al cargar regiones:", error);
        setRegiones([
          "kanto",
          "johto",
          "hoenn",
          "sinnoh",
          "unova",
          "kalos",
          "alola",
          "galar",
          "hisui",
          "paldea",
        ]);
      } finally {
        setLoading(false);
      }
    };
    cargarRegiones();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#ffcb05" size="large" />
        <Text style={{ color: "white", marginTop: 10 }}>Cargando regiones...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Selecciona una región</Text>

      {regiones.map((r) => (
        <TouchableOpacity
          key={r}
          style={styles.boton}
          onPress={() => onSelectRegion(r.toLowerCase())}
        >
          <Text style={styles.text}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.favoritos} onPress={irAFavoritos}>
        <Text style={styles.text2}>⭐ Favoritos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  title: { color: "white", fontSize: 20, marginBottom: 20, fontWeight: "bold" },
  boton: {
    backgroundColor: "#ffcb05",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    width: 180,
    alignItems: "center",
  },
  text: { color: "#000", fontWeight: "bold", fontSize: 16 },
  favoritos: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#ffcb05",
    padding: 10,
    borderRadius: 8,
  },
  text2: {
    color: "#ffffffff"
  },
});
