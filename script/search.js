/** Handles search input changes and decides which search state should be shown. */
function handlePokemonSearch() {
  const searchData = getPokemonSearchData();

  if (searchData.searchValue === "") return resetPokemonSearch();
  if (isPokemonIdAboveLimit(searchData)) return showPokemonIdLimitError();
  if (isPokemonNameTooShort(searchData)) return showPokemonNameLengthError();

  renderPokemonSearchResults(searchData);
}

/** Reads and normalizes the current search input. */
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

/** Resets the search state and renders all loaded Pokémon. */
function resetPokemonSearch() {
  hidePokemonSearchError();
  renderPokemonCards();
}

/** Checks whether the searched Pokémon ID is outside the supported range. */
function isPokemonIdAboveLimit(searchData) {
  return searchData.isIdSearch && searchData.pokemonId > MAX_POKEMON_ID;
}

/** Shows an error when the searched Pokémon ID is above the app limit. */
function showPokemonIdLimitError() {
  showPokemonSearchError(
    `Only Pokémon #001 to #${MAX_POKEMON_ID} are available.`,
  );

  renderPokemonCards([]);
}

/** Checks whether a name search has fewer than three characters. */
function isPokemonNameTooShort(searchData) {
  return !searchData.isIdSearch && searchData.searchValue.length < 3;
}

/** Shows a validation message for too-short name searches. */
function showPokemonNameLengthError() {
  showPokemonSearchError("Min. 3 characters required.");
  renderPokemonCards();
}

/** Renders all Pokémon that match the current search data. */
function renderPokemonSearchResults(searchData) {
  hidePokemonSearchError();

  const filteredPokemonIndexes = getFilteredPokemonIndexes(searchData);

  renderPokemonCards(filteredPokemonIndexes);
}

/** Returns the indexes of all loaded Pokémon matching the current search. */
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

/** Checks whether a Pokémon matches either the searched ID or name. */
function doesPokemonMatchSearch(pokemon, searchData) {
  if (searchData.isIdSearch) {
    return pokemon.id === searchData.pokemonId;
  }

  return pokemon.name.toLowerCase().includes(searchData.searchValue);
}

/** Shows the search validation message with a custom or default text. */
function showPokemonSearchError(message = "Min. 3 characters required.") {
  const searchErrorRef = document.getElementById("pokemon_search_error");

  searchErrorRef.innerText = message;
  searchErrorRef.classList.remove("invisible");
}

/** Hides the search validation message. */
function hidePokemonSearchError() {
  const searchErrorRef = document.getElementById("pokemon_search_error");

  searchErrorRef.classList.add("invisible");
}

/** Clears the search input and hides the current search validation message. */
function clearPokemonSearch() {
  const searchInputRef = document.getElementById("pokemon_search_input");

  searchInputRef.value = "";
  hidePokemonSearchError();
}
