const baseUrl = "https://pokeapi.co/api/v2";

// 🔹 Mapa región → pokedex asociada (número correcto)
const regionToPokedex: Record<string, string> = {
  kanto: "2",
  johto: "3",
  hoenn: "4",
  sinnoh: "5",
  unova: "8",
  kalos: "12",
  alola: "16",
  galar: "27",
  hisui: "29",
  paldea: "31",
};

// 🔹 Lista fija con todas las regiones oficiales
const ALL_REGIONS = [
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
];

// 🔹 Obtener lista de regiones
export async function getRegions() {
  try {
    const res = await fetch(`${baseUrl}/region/`);
    const data = await res.json();
    const apiRegions = data.results.map((r: any) => r.name);

    // Mezclar con nuestra lista fija
    const finalRegions = ALL_REGIONS.filter((r) => apiRegions.includes(r));
    for (const r of ALL_REGIONS) if (!finalRegions.includes(r)) finalRegions.push(r);

    return finalRegions;
  } catch {
    // Si falla la API, devolvemos todas manualmente
    return ALL_REGIONS;
  }
}

// 🔹 Obtener pokemons por región (con ID oficial)
export async function getPokemonsByRegion(regionName: string) {
  try {
    const pokedexId = regionToPokedex[regionName.toLowerCase()];
    if (!pokedexId) throw new Error("Región no reconocida");

    const res = await fetch(`${baseUrl}/pokedex/${pokedexId}`);
    if (!res.ok) throw new Error("No se pudo obtener la región");
    const data = await res.json();

    const list = data.pokemon_entries.map((p: any) => {
      const id = p.pokemon_species.url
        .split("/")
        .filter(Boolean)
        .pop(); // ✅ ID global correcto
      return {
        id: parseInt(id),
        name: p.pokemon_species.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      };
    });

    return list;
  } catch (error) {
    console.error("Error en getPokemonsByRegion:", error);
    return [];
  }
}

// 🔹 Tipos de Pokémon
export async function getPokemonTypes() {
  try {
    const res = await fetch(`${baseUrl}/type/`);
    if (!res.ok) throw new Error("Error al obtener tipos");
    const data = await res.json();
    return data.results.map((t: any) => t.name);
  } catch (error) {
    console.error("Error en getPokemonTypes:", error);
    return [];
  }
}

// 🔹 Detalles de un Pokémon
export async function getPokemonDetails(nameOrId: string) {
  try {
    const res = await fetch(`${baseUrl}/pokemon/${nameOrId}`);
    if (!res.ok) throw new Error("No se pudo obtener el Pokémon");
    const data = await res.json();

    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();

    const descriptionEntry = speciesData.flavor_text_entries.find(
      (e: any) => e.language.name === "es"
    );

    return {
      id: data.id,
      name: data.name,
      types: data.types.map((t: any) => t.type.name),
      height: data.height / 10,
      weight: data.weight / 10,
      sprite:
        data.sprites?.other?.["official-artwork"]?.front_default ??
        data.sprites?.front_default ??
        "",
      description: descriptionEntry ? descriptionEntry.flavor_text : "Sin descripción.",
      evolution_chain_url: speciesData.evolution_chain?.url ?? null,
      moves: data.moves.slice(0, 4).map((m: any) => m.move.name),
    };
  } catch (error) {
    console.error("Error en getPokemonDetails:", error);
    return null;
  }
}

// 🔹 Obtener cadena de evoluciones
export async function getEvolutionChain(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo obtener cadena de evolución");
    const data = await res.json();

    const evolutions: any[] = [];

    function extractEvos(chain: any) {
      const id = chain.species.url.split("/").filter(Boolean).pop();
      evolutions.push({
        id,
        name: chain.species.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      });
      if (chain.evolves_to.length > 0) {
        chain.evolves_to.forEach((next: any) => extractEvos(next));
      }
    }

    extractEvos(data.chain);
    return evolutions;
  } catch (error) {
    console.error("Error en getEvolutionChain:", error);
    return [];
  }
}
