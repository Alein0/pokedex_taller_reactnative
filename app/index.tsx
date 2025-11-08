import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import DetallesPokemon from "./screens/detalles-pokemon";
import FavoritoPokemon from "./screens/favorito-pokemon";
import Inicio from "./screens/inicio";
import ListaPokemon from "./screens/lista-pokemon";

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

  const saveFavorites = async (favoritesArray) => {
  try {
    const jsonValue = JSON.stringify(favoritesArray);
    await AsyncStorage.setItem('@favorites', jsonValue);
  } catch (e) {
    console.error('Error saving favorites', e);
  }
};

//XD


  useEffect(() => {
  const loadFavorites = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@favorites');
      if (jsonValue != null) {
        setFavoritos(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Error loading favorites', e);
    }
  };
  loadFavorites();
}, []);


  const irA = (nombre: string) => setPantalla(nombre);

 const agregarFavorito = (pokemon: Pokemon) => {
  if (!favoritos.find(f => f.id === pokemon.id)) {
    const nuevosFavoritos = [...favoritos, pokemon];
    setFavoritos(nuevosFavoritos);
    saveFavorites(nuevosFavoritos);
  }
};

const eliminarFavorito = (id: number) => {
  const nuevosFavoritos = favoritos.filter(p => p.id !== id);
  setFavoritos(nuevosFavoritos);
  saveFavorites(nuevosFavoritos);
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
        <FavoritoPokemon
          favoritos={favoritos}
          onSelectPokemon={(pokemon) => {
            setPokemonSeleccionado(pokemon);
            setPantalla('detalles');
          }}
          onBack={() => setPantalla('inicio')}
          onRemoveFavorite={eliminarFavorito}
        />
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
