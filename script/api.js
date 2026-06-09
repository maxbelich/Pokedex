async function fetchPokemonList() {
  let response = await fetch(
    `${BASE_URL}pokemon?limit=${POKEMON_LIMIT}&offset=${currentOffset}`,
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