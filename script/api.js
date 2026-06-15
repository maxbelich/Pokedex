/** Handles all API requests for Pokémon, species and evolution data. */

/** Fetches JSON data and throws an error for failed responses. */
async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}: ${response.statusText}`,
    );
  }

  const data = await response.json();

  return data;
}

/** Fetches a paginated list of Pokémon names and detail URLs. */
async function fetchPokemonList(limit = POKEMON_LIMIT, offset = 0) {
  return await fetchJson(`${BASE_URL}pokemon?limit=${limit}&offset=${offset}`);
}

/** Fetches detailed data for one Pokémon from its API URL. */
async function fetchPokemonDetails(url) {
  return await fetchJson(url);
}

/** Fetches species data to access the related evolution chain URL. */
async function fetchPokemonSpecies(pokemonName) {
  return await fetchJson(`${BASE_URL}pokemon-species/${pokemonName}`);
}

/** Fetches the full evolution chain from a species evolution URL. */
async function fetchEvolutionChain(url) {
  return await fetchJson(url);
}

/** Fetches detailed Pokémon data by name for evolution entries. */
async function fetchPokemonDetailsByName(pokemonName) {
  return await fetchJson(`${BASE_URL}pokemon/${pokemonName}`);
}
