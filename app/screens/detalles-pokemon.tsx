import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getPokemonDetails, getEvolutionChain } from "../utils/api";

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

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const info = await getPokemonDetails(pokemon.name || pokemon);
        if (!mounted) return;

        setDetails(info);
        setFavState(Boolean(favoritos?.find((f: any) => f.id === info.id)));

        if (info.evolution_chain_url) {
          const evos = await getEvolutionChain(info.evolution_chain_url);
          if (!mounted) return;
          setEvolutions(evos);
        } else {
          setEvolutions([]);
        }
      } catch (e) {
        console.log("Error cargando detalles:", e);
        Alert.alert("Error", "No se pudieron cargar los detalles del Pokémon.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [pokemon, favoritos]);

  const handleSelectEvolution = async (evo: any) => {
    try {
      setLoading(true);
      const evoDetails = await getPokemonDetails(evo.name);
      if (!evoDetails) {
        Alert.alert("Error", "No se pudieron obtener los detalles de la evolución.");
        return;
      }
      if (onSelectEvolution) onSelectEvolution(evoDetails);
      setDetails(evoDetails);
      if (evoDetails.evolution_chain_url) {
        const evs = await getEvolutionChain(evoDetails.evolution_chain_url);
        setEvolutions(evs);
      } else {
        setEvolutions([]);
      }
    } catch (err) {
      console.log("Error al seleccionar evolución:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!details) return;
    if (favState) {
      onRemoveFavorite(details.id);
      setFavState(false);
    } else {
      onAddFavorite(details);
      setFavState(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffcb05" />
        <Text style={{ color: "white", marginTop: 8 }}>Cargando detalles...</Text>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "white" }}>No hay información disponible.</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>⬅️ Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>⬅️ Volver</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{details.name}</Text>
        <Image source={{ uri: details.sprite }} style={styles.image} />
        <Text style={styles.types}>{details.types.join(", ")}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.info}>Altura: {(details.height / 10).toFixed(1)} m</Text>
        <Text style={styles.info}>Peso: {(details.weight / 10).toFixed(1)} kg</Text>
        <Text style={styles.info}>Región: {details.region || "Desconocida"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Descripción</Text>
        <Text style={styles.text}>
          {details.description || "Sin descripción disponible."}
        </Text>
      </View>

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

      <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteBtn}>
        <Text style={{ color: "black" }}>
          {favState ? "💔 Quitar favorito" : "❤️ Agregar a favoritos"}
        </Text>
      </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: "#1a1a1a", padding: 10 },
  back: { color: "#ffcb05", marginBottom: 10 },
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
