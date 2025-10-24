import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import Inicio from "./screens/inicio";
import ListaPokemon from "./screens/lista-pokemon";
import DetallesPokemon from "./screens/detalles-pokemon";
import FavoritoPokemon from "./screens/favorito-pokemon";

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
}

export default function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [region, setRegion] = useState<string>("");
  const [pokemonSeleccionado, setPokemonSeleccionado] = useState<Pokemon | null>(null);
  const [favoritos, setFavoritos] = useState<Pokemon[]>([]);

  const irA = (nombre: string) => setPantalla(nombre);

  const agregarFavorito = (pokemon: Pokemon) => {
    if (!favoritos.find((f) => f.id === pokemon.id)) {
      setFavoritos([...favoritos, pokemon]);
    }
  };

  const eliminarFavorito = (id: number) => {
    setFavoritos(favoritos.filter((p) => p.id !== id));
  };

  return (
    <View style={styles.container}>
      {pantalla === "inicio" && (
        <Inicio
          onSelectRegion={(r: string) => {
            setRegion(r);
            irA("lista");
          }}
          irAFavoritos={() => irA("favoritos")}
        />
      )}

      {pantalla === "lista" && (
        <ListaPokemon
          region={region}
          onBack={() => irA("inicio")}
          onSelectPokemon={(p: Pokemon) => {
            setPokemonSeleccionado(p);
            irA("detalles");
          }}
        />
      )}

      {pantalla === "detalles" && pokemonSeleccionado && (
        <DetallesPokemon
          pokemon={pokemonSeleccionado}
          onBack={() => irA("lista")}
          onAddFavorite={agregarFavorito}
          onRemoveFavorite={eliminarFavorito}
          favoritos={favoritos}
          onSelectEvolution={(evo: Pokemon) => {
            setPokemonSeleccionado(evo);
          }}
        />
      )}

      {pantalla === "favoritos" && (
        <FavoritoPokemon favoritos={favoritos} onBack={() => irA("inicio")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
});
