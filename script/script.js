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

function prepareInitialLoading() {
  hideLoadMoreButton();
  renderLoadingState();
}

async function loadInitialPokemon() {
  const pokemonList = await fetchPokemonList(POKEMON_LIMIT, currentOffset);

  allPokemon = pokemonList.results;

  await loadPokemonDetails();
}

function renderInitialPokemon() {
  renderPokemonCards();

  if (pokemonDetails.length < MAX_POKEMON_ID) {
    showLoadMoreButton();
  }
}

function handleInitialLoadError(error) {
  console.error("Pokemon could not be loaded:", error);

  renderErrorState("Pokemon could not be loaded. Please try again later.");

  hideLoadMoreButton();
}

function renderMain() {
  const mainContentRef = document.getElementById("main_content");

  mainContentRef.innerHTML = getMainTemplate();
}

function renderPokemonCards(pokemonIndexes = getAllPokemonIndexes()) {
  const pokemonCardsRef = document.getElementById("pokemon_cards");

  if (pokemonIndexes.length === 0) {
    renderNoPokemonFound(pokemonCardsRef);
    return;
  }

  pokemonCardsRef.innerHTML = getPokemonCardsTemplate(pokemonIndexes);
}

function renderNoPokemonFound(pokemonCardsRef) {
  pokemonCardsRef.innerHTML = getNoPokemonFoundTemplate();
}

function getPokemonCardsTemplate(pokemonIndexes) {
  let pokemonCardsTemplate = "";

  for (let index = 0; index < pokemonIndexes.length; index++) {
    const pokemonIndex = pokemonIndexes[index];

    pokemonCardsTemplate += getPokemonCardTemplate(pokemonIndex);
  }

  return pokemonCardsTemplate;
}

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

async function loadPokemonDetails() {
  const pokemonDetailPromises = allPokemon.map((pokemon) => {
    return fetchPokemonDetails(pokemon.url);
  });

  pokemonDetails = await Promise.all(pokemonDetailPromises);
}

function renderLoadingState() {
  const pokemonCardsRef = document.getElementById("pokemon_cards");

  pokemonCardsRef.innerHTML = getLoadingTemplate();
}

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

function getNextLoadData() {
  const nextOffset = currentOffset + POKEMON_LIMIT;

  if (nextOffset >= MAX_POKEMON_ID) return null;

  const remainingPokemon = MAX_POKEMON_ID - nextOffset;

  return {
    offset: nextOffset,
    limit: Math.min(POKEMON_LIMIT, remainingPokemon),
  };
}

function prepareLoadMoreRequest() {
  renderLoadMoreButtonLoading();
  hideLoadMoreError();
}

async function processLoadMoreRequest(loadData) {
  const pokemonBatch = await fetchNextPokemonBatch(loadData);

  appendPokemonBatch(pokemonBatch, loadData.offset);
  handlePokemonSearch();
  hideLoadMoreButtonWhenComplete();
}

async function fetchNextPokemonBatch(loadData) {
  const pokemonList = await fetchPokemonList(loadData.limit, loadData.offset);

  const pokemon = pokemonList.results;
  const details = await loadNewPokemonDetails(pokemon);

  return { pokemon, details };
}

function appendPokemonBatch(pokemonBatch, newOffset) {
  allPokemon = allPokemon.concat(pokemonBatch.pokemon);

  pokemonDetails = pokemonDetails.concat(pokemonBatch.details);

  currentOffset = newOffset;
}

function hideLoadMoreButtonWhenComplete() {
  if (pokemonDetails.length >= MAX_POKEMON_ID) {
    hideLoadMoreButton();
  }
}

function handleLoadMoreError(error) {
  console.error("More Pokemon could not be loaded:", error);
  showLoadMoreError();
}

async function loadNewPokemonDetails(newPokemon) {
  const pokemonDetailPromises = newPokemon.map((pokemon) => {
    return fetchPokemonDetails(pokemon.url);
  });

  return await Promise.all(pokemonDetailPromises);
}

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

function renderLoadMoreButtonDefault() {
  const loadMoreButtonRef = document.getElementById("load_more_btn");

  loadMoreButtonRef.disabled = false;
  loadMoreButtonRef.innerText = "Load More";
}

function formatPokemonId(id) {
  return String(id).padStart(3, "0");
}

function renderErrorState(message) {
  const pokemonCardsRef = document.getElementById("pokemon_cards");

  pokemonCardsRef.innerHTML = getErrorTemplate(message);
}

function hideLoadMoreButton() {
  const loadMoreButtonRef = document.getElementById("load_more_btn");

  loadMoreButtonRef.classList.add("d_none");
}

function showLoadMoreButton() {
  const loadMoreButtonRef = document.getElementById("load_more_btn");

  loadMoreButtonRef.classList.remove("d_none");
}

function showLoadMoreError() {
  const loadMoreErrorRef = document.getElementById("load_more_error");

  loadMoreErrorRef.classList.remove("invisible");
}

function hideLoadMoreError() {
  const loadMoreErrorRef = document.getElementById("load_more_error");

  loadMoreErrorRef.classList.add("invisible");
}

function getPokemonMaxStatValue(pokemon) {
  let maxStatValue = 100;

  for (let index = 0; index < pokemon.stats.length; index++) {
    const statValue = pokemon.stats[index].base_stat;

    if (statValue > maxStatValue) maxStatValue = statValue;
  }

  return maxStatValue;
}
