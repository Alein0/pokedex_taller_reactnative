import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import Inicio from "../screens/inicio";
import ListaPokemon from "../screens/lista-pokemon";
import DetallesPokemon from "../screens/detalles-pokemon";
import FavoritoPokemon from "../screens/favorito-pokemon";

export default function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [region, setRegion] = useState("");
  const [pokemonSeleccionado, setPokemonSeleccionado] = useState<any>(null);
  const [favoritos, setFavoritos] = useState<any[]>([]);

  // Cargar favoritos al iniciar ---
  useEffect(() => {
    const cargarFavoritos = async () => {
      try {
        const data = await AsyncStorage.getItem("favoritos");
        if (data) setFavoritos(JSON.parse(data));
      } catch (error) {
        console.log("Error al cargar favoritos:", error);
      }
    };
    cargarFavoritos();
  }, []);

  // Guardar favoritos cada vez que cambien ---
  useEffect(() => {
    const guardarFavoritos = async () => {
      try {
        await AsyncStorage.setItem("favoritos", JSON.stringify(favoritos));
      } catch (error) {
        console.log("Error al guardar favoritos:", error);
      }
    };
    guardarFavoritos();
  }, [favoritos]);

  // --- Normalizar antes de guardar ---
  const normalizeFavorite = (p: any) => {
    return {
      id: p.id ?? p?.name ?? null,
      name: p.name ?? p?.species?.name ?? "",
      sprite:
        p.sprite ??
        p.sprites?.front_default ??
        p.sprites?.other?.["official-artwork"]?.front_default ??
        null,
      types:
        p.types ??
        (p.types?.map
          ? p.types.map((t: any) => (typeof t === "string" ? t : t.type?.name))
          : []),
    };
  };

  // --- Manejo de favoritos ---
  const agregarFavorito = (pokemon: any) => {
    const fav = normalizeFavorite(pokemon);
    if (!fav.id) return;
    if (!favoritos.some((f) => String(f.id) === String(fav.id))) {
      setFavoritos((prev) => [...prev, fav]);
    }
  };

  const eliminarFavorito = (id: number | string) => {
    setFavoritos((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  // --- Render según pantalla ---
  if (pantalla === "inicio") {
    return (
      <Inicio
        onSelectRegion={(r: string) => {
          setRegion(r);
          setPantalla("lista");
        }}
        irAFavoritos={() => setPantalla("favoritos")}
      />
    );
  }

  if (pantalla === "lista") {
    return (
      <ListaPokemon
        region={region}
        onBack={() => setPantalla("inicio")}
        onSelectPokemon={(p: any) => {
          setPokemonSeleccionado(p);
          setPantalla("detalles");
        }}
      />
    );
  }

  if (pantalla === "detalles") {
    return (
      <DetallesPokemon
        pokemon={pokemonSeleccionado}
        onBack={() => setPantalla("lista")}
        onAddFavorite={agregarFavorito}
        onRemoveFavorite={eliminarFavorito}
        favoritos={favoritos}
        onSelectEvolution={(p: any) => setPokemonSeleccionado(p)}
      />
    );
  }

  if (pantalla === "favoritos") {
    return (
      <FavoritoPokemon
        onSelectPokemon={(p: any) => {
          setPokemonSeleccionado(p);
          setPantalla("detalles");
        }}
        onBack={() => setPantalla("inicio")}
        favoritos={favoritos}
        onRemoveFavorite={eliminarFavorito}
      />
    );
  }

  return null;
}
