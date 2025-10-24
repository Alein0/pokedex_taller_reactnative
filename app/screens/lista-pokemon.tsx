import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getPokemonsByRegion, getPokemonTypes } from "../utils/api";

export default function ListaPokemon({ region, onSelectPokemon, onBack }: any) {
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let cancelado = false;
  (async () => {
    setLoading(true);
    try {
      const list = await getPokemonsByRegion(region);
      if (!cancelado) {
        setPokemons(list);
        setFiltered(list);
        const tipos = await getPokemonTypes();
        setTypes(tipos);
      }
    } catch (err) {
      console.log("Error al cargar la región:", err);
    } finally {
      if (!cancelado) setLoading(false);
    }
  })();

  return () => {
    cancelado = true;
  };
}, [region]);


  useEffect(() => {
    let results = pokemons;
    if (search) {
      results = results.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedType) {
      results = results.filter((p) => p.types?.includes(selectedType));
    }
    setFiltered(results);
  }, [search, selectedType]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#ffcb05" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>⬅️ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Pokémon de {region}</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre..."
        placeholderTextColor="#aaa"
        onChangeText={setSearch}
        value={search}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onSelectPokemon(item)}
          >
            <Image source={{ uri: item.sprite }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a", padding: 10 },
  back: { color: "#ffcb05", marginBottom: 10 },
  title: { color: "white", fontSize: 18, marginBottom: 10 },
  input: {
    backgroundColor: "#2a2a2a",
    color: "white",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
});
