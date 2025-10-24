import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";

let localFavorites: any[] = [];

export default function FavoritoPokemon({ onSelectPokemon, onBack }: any) {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    setFavorites(localFavorites);
  }, []);

  const removeFavorite = (name: string) => {
    localFavorites = localFavorites.filter((f) => f.name !== name);
    setFavorites(localFavorites);
    Alert.alert("Eliminado", `${name} fue quitado de favoritos`);
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>⬅️ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>No hay Pokémon favoritos aún.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>⬅️ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>❤️ Pokémon Favoritos</Text>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.name}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => onSelectPokemon(item)}>
              <Image source={{ uri: item.sprite }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeFavorite(item.name)}>
              <Text style={styles.remove}>❌ Quitar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

// ✅ función auxiliar global que puedes usar desde otros archivos
export function addFavorite(pokemon: any) {
  if (!localFavorites.find((f) => f.name === pokemon.name)) {
    localFavorites.push(pokemon);
  }
}

export function getFavorites() {
  return localFavorites;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a", padding: 10 },
  back: { color: "#ffcb05", marginBottom: 10 },
  title: { color: "white", fontSize: 18, marginBottom: 10, textAlign: "center" },
  card: {
    flex: 1,
    backgroundColor: "#2a2a2a",
    margin: 6,
    borderRadius: 10,
    alignItems: "center",
    padding: 10,
  },
  image: { width: 90, height: 90 },
  name: { color: "white", marginTop: 5, textTransform: "capitalize" },
  remove: { color: "#ff5c5c", marginTop: 5 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  emptyText: { color: "white", fontSize: 16 },
});
