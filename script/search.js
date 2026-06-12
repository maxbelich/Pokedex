function handlePokemonSearch() {
  const searchData = getPokemonSearchData();

  if (searchData.searchValue === "") return resetPokemonSearch();
  if (isPokemonIdAboveLimit(searchData)) return showPokemonIdLimitError();
  if (isPokemonNameTooShort(searchData)) return showPokemonNameLengthError();

  renderPokemonSearchResults(searchData);
}

function getPokemonSearchData() {
  const searchInputRef = document.getElementById("pokemon_search_input");
  const searchValue = searchInputRef.value.trim().toLowerCase();
  const cleanedIdValue = searchValue.replace(/^#/, "");

  return {
    searchValue,
    isIdSearch: /^\d+$/.test(cleanedIdValue),
    pokemonId: Number(cleanedIdValue),
  };
}

function resetPokemonSearch() {
  hidePokemonSearchError();
  renderPokemonCards();
}

function isPokemonIdAboveLimit(searchData) {
  return searchData.isIdSearch && searchData.pokemonId > MAX_POKEMON_ID;
}

function showPokemonIdLimitError() {
  showPokemonSearchError(
    `Only Pokémon #001 to #${MAX_POKEMON_ID} are available.`,
  );

  renderPokemonCards([]);
}

function isPokemonNameTooShort(searchData) {
  return !searchData.isIdSearch && searchData.searchValue.length < 3;
}

function showPokemonNameLengthError() {
  showPokemonSearchError("Min. 3 characters required.");
  renderPokemonCards();
}

function renderPokemonSearchResults(searchData) {
  hidePokemonSearchError();

  const filteredPokemonIndexes = getFilteredPokemonIndexes(searchData);

  renderPokemonCards(filteredPokemonIndexes);
}

function getFilteredPokemonIndexes(searchData) {
  const filteredPokemonIndexes = [];

  for (let index = 0; index < pokemonDetails.length; index++) {
    const pokemon = pokemonDetails[index];

    if (doesPokemonMatchSearch(pokemon, searchData)) {
      filteredPokemonIndexes.push(index);
    }
  }

  return filteredPokemonIndexes;
}

function doesPokemonMatchSearch(pokemon, searchData) {
  if (searchData.isIdSearch) {
    return pokemon.id === searchData.pokemonId;
  }

  return pokemon.name.toLowerCase().includes(searchData.searchValue);
}

function showPokemonSearchError(message = "Min. 3 characters required.") {
  const searchErrorRef = document.getElementById("pokemon_search_error");

  searchErrorRef.innerText = message;
  searchErrorRef.classList.remove("invisible");
}

function hidePokemonSearchError() {
  const searchErrorRef = document.getElementById("pokemon_search_error");

  searchErrorRef.classList.add("invisible");
}