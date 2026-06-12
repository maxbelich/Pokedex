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

async function fetchPokemonList(limit = POKEMON_LIMIT, offset = 0) {
  return await fetchJson(`${BASE_URL}pokemon?limit=${limit}&offset=${offset}`);
}

async function fetchPokemonDetails(url) {
  return await fetchJson(url);
}

async function fetchPokemonSpecies(pokemonName) {
  return await fetchJson(`${BASE_URL}pokemon-species/${pokemonName}`);
}

async function fetchEvolutionChain(url) {
  return await fetchJson(url);
}

async function fetchPokemonDetailsByName(pokemonName) {
  return await fetchJson(`${BASE_URL}pokemon/${pokemonName}`);
}
