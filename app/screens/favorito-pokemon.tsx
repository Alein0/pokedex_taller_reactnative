import React from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FavoritoPokemon({ favoritos, onSelectPokemon, onBack, onRemoveFavorite }: any) {
  // Si no hay favoritos
  if (!favoritos || favoritos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
      <TouchableOpacity onPress={onBack} style={styles.volverBtn} activeOpacity={0.8}>
  <Text style={styles.volverText}>Volver</Text>
</TouchableOpacity>

        <Text style={styles.emptyText}>No hay Pokémon favoritos aún.</Text>
      </View>
    );
  }

  const handleRemove = (id: number | string, name?: string) => {
    if (onRemoveFavorite) {
      onRemoveFavorite(id);
      Alert.alert("Eliminado", `${name ?? "Pokémon"} fue quitado de favoritos`);
    }
  };

  const handleSelect = (pokemon: any) => {
    if (onSelectPokemon) {
      onSelectPokemon(pokemon);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.volverBtn} activeOpacity={0.8}>
        <Text style={styles.volverText}> Volver</Text>
      </TouchableOpacity>


      <Text style={styles.title}>❤️ Pokémon Favoritos</Text>

      <FlatList
        data={favoritos}
        keyExtractor={(item) => String(item.id ?? item.name)}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => handleSelect(item)}>
              <Image source={{ uri: item.sprite ?? null }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleRemove(item.id ?? item.name, item.name)}>
              <Text style={styles.remove}>❌ Quitar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  volverBtn: {
    marginTop: 40,
    backgroundColor: "#ffcb05",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 25,
    alignSelf: "flex-start",
    shadowColor: "#ffcb05",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6, // para Android
    transform: [{ scale: 1 }],
  },
  volverText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
  },

  container: { flex: 1, backgroundColor: "#1a1a1a", padding: 10 },
  title: { 
marginTop:30,
color: "#ffffff",
  fontSize: 16,
  fontWeight: "bold",
  textAlign:"center"
   },
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
