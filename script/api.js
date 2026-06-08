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