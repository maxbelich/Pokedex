function handlePokemonSearch() {
  const searchInputRef = document.getElementById("pokemon_search_input");
  let searchValue = searchInputRef.value.trim().toLowerCase();
  let cleanedSearchValue = searchValue.replace("#", "");
  let isIdSearch = /^\d+$/.test(cleanedSearchValue);

  if (searchValue === "") {
    hidePokemonSearchError();
    renderPokemonCards();
    return;
  }

  if (!isIdSearch && searchValue.length < 3) {
    showPokemonSearchError();
    renderPokemonCards();
    return;
  }

  hidePokemonSearchError();

  let filteredPokemonIndexes = getFilteredPokemonIndexes(searchValue);
  renderPokemonCards(filteredPokemonIndexes);
}

function getFilteredPokemonIndexes(searchValue) {
  let filteredPokemonIndexes = [];
  let cleanedSearchValue = searchValue.replace("#", "");

  for (
    let pokemonIndex = 0;
    pokemonIndex < pokemonDetails.length;
    pokemonIndex++
  ) {
    let pokemon = pokemonDetails[pokemonIndex];
    let pokemonName = pokemon.name.toLowerCase();
    let pokemonId = String(pokemon.id);
    let formattedPokemonId = formatPokemonId(pokemon.id);

    if (
      pokemonName.includes(searchValue) ||
      pokemonId === cleanedSearchValue ||
      formattedPokemonId === cleanedSearchValue
    ) {
      filteredPokemonIndexes.push(pokemonIndex);
    }
  }

  return filteredPokemonIndexes;
}

function showPokemonSearchError() {
  const searchErrorRef = document.getElementById("pokemon_search_error");

  searchErrorRef.classList.remove("invisible");
}

function hidePokemonSearchError() {
  const searchErrorRef = document.getElementById("pokemon_search_error");

  searchErrorRef.classList.add("invisible");
}