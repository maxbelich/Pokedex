let currentPokemonIndex = 0;

async function init() {
  renderMain();
  renderLoadingState();

  let pokemonList = await fetchPokemonList();
  allPokemon = pokemonList.results;

  await loadPokemonDetails();

  renderPokemonCards();
}

function renderMain() {
  const mainContentRef = document.getElementById("main_content");

  mainContentRef.innerHTML = getMainTemplate();
}

function renderPokemonCards(pokemonIndexes = getAllPokemonIndexes()) {
  const pokemonCardsRef = document.getElementById("pokemon_cards");
  pokemonCardsRef.innerHTML = "";

  if (pokemonIndexes.length === 0) {
    pokemonCardsRef.innerHTML = getNoPokemonFoundTemplate();
    return;
  }

  for (let index = 0; index < pokemonIndexes.length; index++) {
    let pokemonIndex = pokemonIndexes[index];
    pokemonCardsRef.innerHTML += getPokemonCardTemplate(pokemonIndex);
  }
}

function getAllPokemonIndexes() {
  let pokemonIndexes = [];

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

function openPokemonDialog(pokemonIndex) {
  const dialogRef = document.getElementById("pokemon_dialog");

  currentPokemonIndex = pokemonIndex;

  document.body.classList.add("no_scroll");
  dialogRef.innerHTML = getPokemonDialogTemplate(pokemonIndex);

  if (!dialogRef.open) {
    dialogRef.showModal();
  }

  dialogRef.removeEventListener("click", closeDialogOnBackdropClick);
  dialogRef.addEventListener("click", closeDialogOnBackdropClick);
}

function closePokemonDialog() {
  const dialogRef = document.getElementById("pokemon_dialog");

  document.body.classList.remove("no_scroll");
  dialogRef.removeEventListener("click", closeDialogOnBackdropClick);
  dialogRef.close();
}

function closeDialogOnBackdropClick(event) {
  const dialogRef = document.getElementById("pokemon_dialog");

  if (event.target === dialogRef) {
    closePokemonDialog();
  }
}

async function renderDialogTab(pokemonIndex, tabName) {
  const tabContentRef = document.getElementById("dialog_tab_content");

  updateActiveDialogTab(tabName);

  if (tabName === "about") {
    tabContentRef.innerHTML = getDialogAboutTemplate(pokemonIndex);
  }

  if (tabName === "stats") {
    tabContentRef.innerHTML = getDialogStatsTemplate(pokemonIndex);
  }

  if (tabName === "evolution") {
    tabContentRef.innerHTML = getDialogTabLoadingTemplate();

    let evolutionNames = await loadPokemonEvolution(pokemonIndex);
    tabContentRef.innerHTML = getDialogEvolutionTemplate(evolutionNames);
  }
}

function updateActiveDialogTab(activeTabName) {
  document.querySelectorAll(".dialog_tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  document
    .getElementById(`dialog_tab_${activeTabName}`)
    .classList.add("active");
}

async function loadPokemonEvolution(pokemonIndex) {
  let pokemon = pokemonDetails[pokemonIndex];
  let pokemonName = pokemon.name;

  if (evolutionCache[pokemonName]) {
    return evolutionCache[pokemonName];
  }

  let speciesData = await fetchPokemonSpecies(pokemonName);
  let evolutionData = await fetchEvolutionChain(
    speciesData.evolution_chain.url,
  );
  let evolutionNames = getEvolutionNamesFromChain(evolutionData.chain);

  evolutionCache[pokemonName] = evolutionNames;

  return evolutionNames;
}

function getEvolutionNamesFromChain(chain) {
  let evolutionNames = [];
  let currentEvolution = chain;

  while (currentEvolution) {
    evolutionNames.push(currentEvolution.species.name);
    currentEvolution = currentEvolution.evolves_to[0];
  }

  return evolutionNames;
}

function showPreviousPokemon() {
  let previousPokemonIndex = currentPokemonIndex - 1;

  if (previousPokemonIndex < 0) {
    previousPokemonIndex = pokemonDetails.length - 1;
  }

  openPokemonDialog(previousPokemonIndex);
}

function showNextPokemon() {
  let nextPokemonIndex = currentPokemonIndex + 1;

  if (nextPokemonIndex >= pokemonDetails.length) {
    nextPokemonIndex = 0;
  }

  openPokemonDialog(nextPokemonIndex);
}

async function loadMorePokemon() {
  currentOffset += POKEMON_LIMIT;

  renderLoadMoreButtonLoading();

  let pokemonList = await fetchPokemonList();
  let newPokemon = pokemonList.results;
  let newPokemonDetails = await loadNewPokemonDetails(newPokemon);

  allPokemon = allPokemon.concat(newPokemon);
  pokemonDetails = pokemonDetails.concat(newPokemonDetails);

  handlePokemonSearch();
  renderLoadMoreButtonDefault();
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
  loadMoreButtonRef.innerText = "Loading...";
}

function renderLoadMoreButtonDefault() {
  const loadMoreButtonRef = document.getElementById("load_more_btn");

  loadMoreButtonRef.disabled = false;
  loadMoreButtonRef.innerText = "Load More";
}

function formatPokemonId(id) {
  return String(id).padStart(3, "0");
}