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
  ScrollView,
} from "react-native";
import { getPokemonsByRegion, getPokemonTypes, getPokemonDetails, getPokemonsByType } from "../utils/api";

export default function ListaPokemon({ region, onSelectPokemon, onBack }: any) {
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingType, setLoadingType] = useState(false);
  const [pokemonsOfTypeSet, setPokemonsOfTypeSet] = useState<Set<string> | null>(null);

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

  // Cuando cambian search / selectedType / pokemons / pokemonsOfTypeSet, recomputar visible
  useEffect(() => {
    let results = pokemons;

    // filtro por nombre (subcadena)
    if (search) {
      results = results.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // filtro por tipo: si tenemos el set de nombres de pokemons de ese tipo, intersectamos por name
    if (selectedType) {
      if (pokemonsOfTypeSet) {
        results = results.filter((p) => pokemonsOfTypeSet.has(p.name));
      } else {
        // aún no cargó el set (posible si el usuario cambió el tipo rápido) -> vaciar temporalmente
        results = [];
      }
    }

    setFiltered(results);
  }, [search, selectedType, pokemons, pokemonsOfTypeSet]);

  // Manejar selección de tipo (carga del set correspondiente)
  const handleSelectType = async (typeName: string) => {
    if (!typeName) {
      setSelectedType("");
      setPokemonsOfTypeSet(null);
      return;
    }

    // si mismo tipo, deseleccionar
    if (selectedType === typeName) {
      setSelectedType("");
      setPokemonsOfTypeSet(null);
      return;
    }

    setSelectedType(typeName);
    setLoadingType(true);
    try {
      const setOfNames = await getPokemonsByType(typeName);
      setPokemonsOfTypeSet(setOfNames);
    } catch (err) {
      console.log("Error al cargar pokemons por tipo:", err);
      setPokemonsOfTypeSet(new Set()); // evitar crash
    } finally {
      setLoadingType(false);
    }
  };

  const handleSelect = async (item: any) => {
    // Si item ya contiene información completa (id, sprite) la pasamos tal cual,
    // si no, pedimos detalles antes de navegar para que DetallesPokemon funcione correctamente.
    if (item.id && item.sprite && item.types && item.types.length > 0) {
      onSelectPokemon(item);
    } else {
      try {
        setLoading(true);
        const det = await getPokemonDetails(item.name || item);
        if (det) onSelectPokemon(det);
      } catch (err) {
        console.log("Error al obtener detalles al seleccionar:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#ffcb05" size="large"  />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text  style={styles.vol}> Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Pokémon de {region}</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre..."
        placeholderTextColor="#aaa"
        onChangeText={setSearch}
        value={search}
      />

      {/* Selector de tipos */}
      <View style={{ marginVertical: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 6 }}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === "" ? styles.typeButtonSelected : null,
            ]}
            onPress={() => handleSelectType("")}
          >
            <Text style={styles.typeText}>Todos</Text>
          </TouchableOpacity>

          {types.map((t: string) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeButton,
                selectedType === t ? styles.typeButtonSelected : null,
              ]}
              onPress={() => handleSelectType(t)}
            >
              <Text style={styles.typeText}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {loadingType && (
          <View style={{ marginTop: 6 }}>
            <ActivityIndicator size="small" color="#ffcb05" />
            <Text style={{ color: "white", marginTop: 4 }}>Cargando tipo...</Text>
          </View>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id ?? item.name)}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelect(item)}
          >
            <Image source={{ uri: item.sprite ?? null }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a", padding: 10 },
  vol: {marginTop:50, color:"#ffcb05"},
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

  // tipos
  typeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#333333",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  typeButtonSelected: {
    backgroundColor: "#ffcb05",
    borderColor: "#ffcb05",
  },
  typeText: {
    color: "white",
    textTransform: "capitalize",
    fontWeight: "600",
  },
});
