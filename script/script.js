/** Controls the main app flow, including initial loading,
 Pokémon card rendering, Load More behavior and shared UI states. */

/** Starts the app, renders the layout and loads the first Pokémon batch. */
async function init() {
  renderMain();
  setupDialogEvents();
  prepareInitialLoading();

  try {
    await loadInitialPokemon();
    renderInitialPokemon();
  } catch (error) {
    handleInitialLoadError(error);
  }
}

/** Hides the Load More button and shows the initial loading state. */
function prepareInitialLoading() {
  hideLoadMoreButton();
  renderLoadingState();
}

/** Fetches the first Pokémon list and loads the matching detail data. */
async function loadInitialPokemon() {
  const pokemonList = await fetchPokemonList(POKEMON_LIMIT, currentOffset);

  allPokemon = pokemonList.results;

  await loadPokemonDetails();
}

/** Renders the initial Pokémon cards and shows Load More if more Pokémon exist. */
function renderInitialPokemon() {
  renderPokemonCards();

  if (pokemonDetails.length < MAX_POKEMON_ID) {
    showLoadMoreButton();
  }
}

/** Handles errors from the first app load. */
function handleInitialLoadError(error) {
  console.error("Pokemon could not be loaded:", error);

  renderErrorState("Pokemon could not be loaded. Please try again later.");

  hideLoadMoreButton();
}

/** Renders the static page layout. */
function renderMain() {
  const mainContentRef = document.getElementById("main_content");

  mainContentRef.innerHTML = getMainTemplate();
}

/** Renders the currently selected Pokémon cards and stores their visible indexes. */
function renderPokemonCards(pokemonIndexes = getAllPokemonIndexes()) {
  const pokemonCardsRef = document.getElementById("pokemon_cards");

  visiblePokemonIndexes = pokemonIndexes.slice();

  if (pokemonIndexes.length === 0) {
    renderNoPokemonFound(pokemonCardsRef);
    return;
  }

  pokemonCardsRef.innerHTML = getPokemonCardsTemplate(pokemonIndexes);
}

/** Renders the empty search result state. */
function renderNoPokemonFound(pokemonCardsRef) {
  pokemonCardsRef.innerHTML = getNoPokemonFoundTemplate();
}

/** Builds all Pokémon card templates for the given indexes. */
function getPokemonCardsTemplate(pokemonIndexes) {
  let pokemonCardsTemplate = "";

  for (let index = 0; index < pokemonIndexes.length; index++) {
    const pokemonIndex = pokemonIndexes[index];

    pokemonCardsTemplate += getPokemonCardTemplate(pokemonIndex);
  }

  return pokemonCardsTemplate;
}

/** Returns indexes for all currently loaded Pokémon. */
function getAllPokemonIndexes() {
  const pokemonIndexes = [];

  for (
    let pokemonIndex = 0;
    pokemonIndex < pokemonDetails.length;
    pokemonIndex++
  ) {
    pokemonIndexes.push(pokemonIndex);
  }

  return pokemonIndexes;
}

/** Loads detailed data for all Pokémon in the current list. */
async function loadPokemonDetails() {
  const pokemonDetailPromises = allPokemon.map((pokemon) => {
    return fetchPokemonDetails(pokemon.url);
  });

  pokemonDetails = await Promise.all(pokemonDetailPromises);
}

/** Renders the loading template inside the Pokémon card area. */
function renderLoadingState() {
  const pokemonCardsRef = document.getElementById("pokemon_cards");

  pokemonCardsRef.innerHTML = getLoadingTemplate();
}

/** Loads the next Pokémon batch and updates the rendered card list. */
async function loadMorePokemon() {
  const loadData = getNextLoadData();

  if (!loadData) return hideLoadMoreButton();

  prepareLoadMoreRequest();

  try {
    await processLoadMoreRequest(loadData);
  } catch (error) {
    handleLoadMoreError(error);
  } finally {
    renderLoadMoreButtonDefault();
  }
}

/** Calculates the next offset and limit for the Load More request. */
function getNextLoadData() {
  const nextOffset = currentOffset + POKEMON_LIMIT;

  if (nextOffset >= MAX_POKEMON_ID) return null;

  const remainingPokemon = MAX_POKEMON_ID - nextOffset;

  return {
    offset: nextOffset,
    limit: Math.min(POKEMON_LIMIT, remainingPokemon),
  };
}

/** Prepares the UI before loading another Pokémon batch. */
function prepareLoadMoreRequest() {
  renderLoadMoreButtonLoading();
  hideLoadMoreError();
}

/** Fetches, stores and renders the next Pokémon batch. */
async function processLoadMoreRequest(loadData) {
  const pokemonBatch = await fetchNextPokemonBatch(loadData);

  appendPokemonBatch(pokemonBatch, loadData.offset);
  clearPokemonSearch();
  renderPokemonCards();
  hideLoadMoreButtonWhenComplete();
}

/** Fetches the next Pokémon list and its detailed Pokémon data. */
async function fetchNextPokemonBatch(loadData) {
  const pokemonList = await fetchPokemonList(loadData.limit, loadData.offset);

  const pokemon = pokemonList.results;
  const details = await loadNewPokemonDetails(pokemon);

  return { pokemon, details };
}

/** Adds the newly loaded Pokémon data to the global app state. */
function appendPokemonBatch(pokemonBatch, newOffset) {
  allPokemon = allPokemon.concat(pokemonBatch.pokemon);

  pokemonDetails = pokemonDetails.concat(pokemonBatch.details);

  currentOffset = newOffset;
}

/** Hides the Load More button after the final available Pokémon was loaded. */
function hideLoadMoreButtonWhenComplete() {
  if (pokemonDetails.length >= MAX_POKEMON_ID) {
    hideLoadMoreButton();
  }
}

/** Handles errors from loading additional Pokémon. */
function handleLoadMoreError(error) {
  console.error("More Pokemon could not be loaded:", error);
  showLoadMoreError();
}

/** Loads detail data for a newly fetched Pokémon batch. */
async function loadNewPokemonDetails(newPokemon) {
  const pokemonDetailPromises = newPokemon.map((pokemon) => {
    return fetchPokemonDetails(pokemon.url);
  });

  return await Promise.all(pokemonDetailPromises);
}

/** Disables the Load More button and shows its loading state. */
function renderLoadMoreButtonLoading() {
  const loadMoreButtonRef = document.getElementById("load_more_btn");

  loadMoreButtonRef.disabled = true;

  loadMoreButtonRef.innerHTML = /*html*/ `
    Loading
    <span class="loading_dot">.</span>
    <span class="loading_dot">.</span>
    <span class="loading_dot">.</span>
  `;
}

/** Restores the default Load More button state. */
function renderLoadMoreButtonDefault() {
  const loadMoreButtonRef = document.getElementById("load_more_btn");

  loadMoreButtonRef.disabled = false;
  loadMoreButtonRef.innerText = "Load More";
}

/** Formats a Pokémon ID with leading zeros. */
function formatPokemonId(id) {
  return String(id).padStart(3, "0");
}

/** Renders a general error message inside the Pokémon card area. */
function renderErrorState(message) {
  const pokemonCardsRef = document.getElementById("pokemon_cards");

  pokemonCardsRef.innerHTML = getErrorTemplate(message);
}

/** Hides the Load More button. */
function hideLoadMoreButton() {
  const loadMoreButtonRef = document.getElementById("load_more_btn");

  loadMoreButtonRef.classList.add("d_none");
}

/** Shows the Load More button. */
function showLoadMoreButton() {
  const loadMoreButtonRef = document.getElementById("load_more_btn");

  loadMoreButtonRef.classList.remove("d_none");
}

/** Shows the Load More error message. */
function showLoadMoreError() {
  const loadMoreErrorRef = document.getElementById("load_more_error");

  loadMoreErrorRef.classList.remove("invisible");
}

/** Hides the Load More error message. */
function hideLoadMoreError() {
  const loadMoreErrorRef = document.getElementById("load_more_error");

  loadMoreErrorRef.classList.add("invisible");
}

/** Returns the highest stat value, using 100 as the default minimum scale. */
function getPokemonMaxStatValue(pokemon) {
  let maxStatValue = 100;

  for (let index = 0; index < pokemon.stats.length; index++) {
    const statValue = pokemon.stats[index].base_stat;

    if (statValue > maxStatValue) maxStatValue = statValue;
  }

  return maxStatValue;
}

/** Converts Pokémon stat names from the API into shorter display labels. */
function formatPokemonStatName(statName) {
  if (statName === "hp") {
    return "HP";
  }

  if (statName === "special-attack") {
    return "Sp. Atk";
  }

  if (statName === "special-defense") {
    return "Sp. Def";
  }

  return formatPokemonText(statName);
}

/** Converts API text like "special-attack" into readable text like "Special Attack". */
function formatPokemonText(text) {
  return text
    .replace(/-/g, " ")
    .replace(/\b\w/g, (firstLetter) => firstLetter.toUpperCase());
}

/** Builds the ability labels for the first two Pokémon abilities. */
function getPokemonAbilitiesTemplate(pokemon) {
  const abilities = pokemon.abilities.slice(0, 2);
  let abilitiesTemplate = "";

  for (let abilityIndex = 0; abilityIndex < abilities.length; abilityIndex++) {
    const abilityName = abilities[abilityIndex].ability.name;

    abilitiesTemplate += /*html*/ `
      <span>${formatPokemonText(abilityName)}</span>
    `;
  }

  return abilitiesTemplate;
}

/** Builds all stat row templates for one Pokémon. */
function getPokemonStatsTemplate(pokemon) {
  const mainType = pokemon.types[0].type.name;
  const mainColor = typeColors[mainType] || "#777";
  const maxStatValue = getPokemonMaxStatValue(pokemon);
  let statsTemplate = "";

  for (let statIndex = 0; statIndex < pokemon.stats.length; statIndex++) {
    statsTemplate += getPokemonStatRowTemplate(
      pokemon.stats[statIndex],
      maxStatValue,
      mainColor,
    );
  }

  return statsTemplate;
}

/** Builds all type badge templates for one Pokémon. */
function getPokemonTypeBadgesTemplate(pokemonTypes) {
  let typesTemplate = "";

  for (let typeIndex = 0; typeIndex < pokemonTypes.length; typeIndex++) {
    const typeName = pokemonTypes[typeIndex].type.name;
    const typeColor = typeColors[typeName] || "#777";

    typesTemplate += getPokemonTypeTemplate(typeName, typeColor);
  }

  return typesTemplate;
}