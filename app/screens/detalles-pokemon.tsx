import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getEvolutionChain, getPokemonDetails } from "../utils/api";
type PokemonDetails = {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  sprite: string;
  description?: string;
  moves?: string[];
  region?: string;
  evolution_chain_url?: string | null;
};

export default function DetallesPokemon({
  pokemon,
  onBack,
  onAddFavorite,
  onRemoveFavorite,
  favoritos,
  onSelectEvolution,
}: any) {
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [evolutions, setEvolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favState, setFavState] = useState(false);

  // Cargar detalles del Pokémon
  useEffect(() => {
    let mounted = true;

    async function loadDetails() {
      setLoading(true);
      try {
        // pokemon puede ser nombre, id o un objeto con .name
        const info = await getPokemonDetails(pokemon.name ?? pokemon, pokemon.region);
        if (!mounted || !info) return;

        setDetails(info);
        // Comparar con String para evitar mismatch number/string
        setFavState(Boolean(favoritos?.some((f: any) => String(f.id) === String(info.id))));

        if (info.evolution_chain_url) {
          const evos = await getEvolutionChain(info.evolution_chain_url);
          if (mounted) setEvolutions(evos || []);
        } else {
          setEvolutions([]);
        }
      } catch (error) {
        console.log("Error cargando detalles:", error);
        Alert.alert("Error", "No se pudieron cargar los detalles del Pokémon.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDetails();
    return () => {
      mounted = false;
    };
  }, [pokemon, favoritos]);

  // Cambiar de Pokémon al seleccionar una evolución
  const handleSelectEvolution = async (evo: any) => {
    if (!evo || !evo.name) return;
    try {
      setLoading(true);
      const evoDetails = await getPokemonDetails(evo.name);
      if (!evoDetails) {
        Alert.alert("Error", "No se pudieron obtener los detalles de la evolución.");
        return;
      }

      setDetails(evoDetails);
      if (onSelectEvolution) onSelectEvolution(evoDetails);

      if (evoDetails.evolution_chain_url) {
        const evs = await getEvolutionChain(evoDetails.evolution_chain_url);
        setEvolutions(evs || []);
      } else {
        setEvolutions([]);
      }
    } catch (error) {
      console.log("Error al seleccionar evolución:", error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar o quitar de favoritos
  const toggleFavorite = () => {
    if (!details) return;

    const yaEsFavorito = favoritos.some((f: any) => String(f.id) === String(details.id));

    if (yaEsFavorito) {
      onRemoveFavorite(details.id);
      setFavState(false);
    } else {
      // Guarda una versión normalizada del favorito
      const fav = {
        id: details.id,
        name: details.name,
        sprite: details.sprite,
        types: details.types,
        region: details.region,
      };
      onAddFavorite(fav);
      setFavState(true);
    }
  };

  // Mostrar indicador de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffcb05" />
        <Text style={{ color: "white", marginTop: 8 }}>Cargando detalles...</Text>
      </View>
    );
  }

  // Si no hay datos
  if (!details) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "white" }}>No hay información disponible.</Text>
              <TouchableOpacity onPress={onBack} style={styles.volverBtn} activeOpacity={0.8}>
                <Text style={styles.volverText}>Volver</Text>
              </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
            <TouchableOpacity onPress={onBack} style={styles.volverBtn} activeOpacity={0.8}>
              <Text style={styles.volverText}>Volver</Text>
            </TouchableOpacity>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>{details.name}</Text>
        <Image source={{ uri: details.sprite }} style={styles.image} />
        <Text style={styles.types}>{details.types.join(", ")}</Text>
      </View>

      {/* Información básica */}
      <View style={styles.infoBox}>
        <Text style={styles.info}>Altura: {(details.height / 10).toFixed(1)} m</Text>
        <Text style={styles.info}>Peso: {(details.weight / 10).toFixed(1)} kg</Text>
        <Text style={styles.info}>Región: {details.region ? details.region : "Desconocida"}</Text>
      </View>

      {/* Descripción */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Descripción</Text>
        <Text style={styles.text}>
          {details.description || "Sin descripción disponible."}
        </Text>
      </View>

      {/* Movimientos */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Ataques</Text>
        {details.moves && details.moves.length > 0 ? (
          details.moves.slice(0, 10).map((m, i) => (
            <Text key={i} style={styles.move}>
              • {m}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>Sin movimientos disponibles.</Text>
        )}
      </View>

      {/* Botón de favoritos */}
      <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteBtn}>
        <Text style={{ color: "black" }}>
          {favState ? "💔 Quitar de favoritos" : "❤️ Agregar a favoritos"}
        </Text>
      </TouchableOpacity>

      {/* Evoluciones */}
      {evolutions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Evoluciones</Text>
          <View style={styles.evolutionRow}>
            {evolutions.map((evo) => (
              <TouchableOpacity
                key={evo.name}
                onPress={() => handleSelectEvolution(evo)}
                style={{ alignItems: "center" }}
              >
                <Image source={{ uri: evo.sprite }} style={styles.evoImage} />
                <Text style={styles.evoName}>{evo.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
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
  header: { alignItems: "center", marginBottom: 20 },
  title: { color: "white", fontSize: 24, textTransform: "capitalize" },
  image: { width: 160, height: 160, marginVertical: 8 },
  types: { color: "#ffcb05", marginTop: 5, fontWeight: "bold" },
  infoBox: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  info: { color: "white" },
  section: { marginBottom: 15 },
  subtitle: { color: "#ffcb05", fontSize: 18, marginBottom: 5 },
  move: { color: "white", marginLeft: 5 },
  evolutionRow: { flexDirection: "row", justifyContent: "space-around" },
  evoImage: { width: 80, height: 80 },
  evoName: { color: "white", textAlign: "center", textTransform: "capitalize" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  favoriteBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ffcb05",
    alignItems: "center",
    marginVertical: 12,
  },
  text: { color: "white" },
});
