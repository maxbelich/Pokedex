async function init() {
  renderMain();

  let pokemonList = await fetchPokemonList();
  allPokemon = pokemonList.results;

  await loadPokemonDetails();

  renderPokemonCards();
}

function renderMain() {
  const mainContentRef = document.getElementById("main_content");

  mainContentRef.innerHTML = getMainTemplate();
}

function renderPokemonCards() {
  const pokemonCardsRef = document.getElementById("pokemon_cards");
  pokemonCardsRef.innerHTML = "";

  for (let pokemonIndex = 0; pokemonIndex < allPokemon.length; pokemonIndex++) {
    pokemonCardsRef.innerHTML += getPokemonCardTemplate(pokemonIndex);
  }
}

async function loadPokemonDetails() {
  pokemonDetails = [];

  for (let pokemonIndex = 0; pokemonIndex < allPokemon.length; pokemonIndex++) {
    let pokemon = await fetchPokemonDetails(allPokemon[pokemonIndex].url);
    pokemonDetails.push(pokemon);
  }

  console.log(pokemonDetails);
}