async function fetchPokemonList(limit = POKEMON_LIMIT) {
  let response = await fetch(
    `${BASE_URL}pokemon?limit=${limit}&offset=${currentOffset}`,
  );
  let data = await response.json();

  return data;
}

async function fetchPokemonDetails(url) {
  let response = await fetch(url);
  let data = await response.json();

  return data;
}

async function fetchPokemonSpecies(pokemonName) {
  let response = await fetch(`${BASE_URL}pokemon-species/${pokemonName}`);
  let data = await response.json();

  return data;
}

async function fetchEvolutionChain(url) {
  let response = await fetch(url);
  let data = await response.json();

  return data;
}

async function fetchPokemonDetailsByName(pokemonName) {
  let response = await fetch(`${BASE_URL}pokemon/${pokemonName}`);
  let data = await response.json();

  return data;
}