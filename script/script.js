let currentPokemonIndex = 0;
let currentDialogTab = "about";
let lockedScrollY = 0;

async function init() {
  renderMain();
  hideLoadMoreButton();
  renderLoadingState();

  try {
    let pokemonList = await fetchPokemonList();
    allPokemon = pokemonList.results;

    await loadPokemonDetails();

    renderPokemonCards();
    showLoadMoreButton();
  } catch (error) {
    console.error("Pokemon could not be loaded:", error);
    renderErrorState("Pokemon could not be loaded. Please try again later.");
    hideLoadMoreButton();
  }
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
  const isDialogAlreadyOpen = dialogRef.open;

  currentPokemonIndex = pokemonIndex;

  if (!isDialogAlreadyOpen) {
    currentDialogTab = "about";
    lockedScrollY = window.scrollY;
    document.body.style.setProperty("--scroll-y", `-${lockedScrollY}px`);
    document.body.classList.add("no_scroll");
    dialogRef.showModal();
  }

  dialogRef.innerHTML = getPokemonDialogTemplate(pokemonIndex);

  if (currentDialogTab !== "about") {
    renderDialogTab(pokemonIndex, currentDialogTab);
  }

  dialogRef.removeEventListener("click", closeDialogOnBackdropClick);
  dialogRef.addEventListener("click", closeDialogOnBackdropClick);
}

function closePokemonDialog() {
  const dialogRef = document.getElementById("pokemon_dialog");

  currentDialogTab = "about";
  document.body.classList.remove("no_scroll");
  document.body.style.removeProperty("--scroll-y");
  dialogRef.removeEventListener("click", closeDialogOnBackdropClick);
  dialogRef.close();

  window.scrollTo(0, lockedScrollY);
}

function closeDialogOnBackdropClick(event) {
  const dialogRef = document.getElementById("pokemon_dialog");

  if (event.target === dialogRef) {
    closePokemonDialog();
  }
}

async function renderDialogTab(pokemonIndex, tabName) {
  const tabContentRef = document.getElementById("dialog_tab_content");

  currentDialogTab = tabName;

  updateActiveDialogTab(tabName);

  if (tabName === "about") {
    tabContentRef.innerHTML = getDialogAboutTemplate(pokemonIndex);
  }

  if (tabName === "stats") {
    tabContentRef.innerHTML = getDialogStatsTemplate(pokemonIndex);
  }

  if (tabName === "evolution") {
    tabContentRef.innerHTML = getDialogTabLoadingTemplate();

    let evolutionPaths = await loadPokemonEvolution(pokemonIndex);
    tabContentRef.innerHTML = getDialogEvolutionTemplate(evolutionPaths);
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
  let evolutionPaths = getEvolutionPathsFromChain(evolutionData.chain);

  await addPokemonDetailsToEvolutionPaths(evolutionPaths);

  evolutionCache[pokemonName] = evolutionPaths;

  return evolutionPaths;
}

function getEvolutionPathsFromChain(chain, conditionText = "") {
  let currentStep = {
    name: chain.species.name,
    condition: conditionText,
    pokemon: null,
  };

  if (chain.evolves_to.length === 0) {
    return [[currentStep]];
  }

  let evolutionPaths = [];

  for (
    let evolutionIndex = 0;
    evolutionIndex < chain.evolves_to.length;
    evolutionIndex++
  ) {
    let nextEvolution = chain.evolves_to[evolutionIndex];
    let evolutionDetails = nextEvolution.evolution_details[0];
    let nextConditionText = getEvolutionConditionText(evolutionDetails);
    let nextPaths = getEvolutionPathsFromChain(
      nextEvolution,
      nextConditionText,
    );

    for (let pathIndex = 0; pathIndex < nextPaths.length; pathIndex++) {
      evolutionPaths.push([currentStep].concat(nextPaths[pathIndex]));
    }
  }

  return evolutionPaths;
}

async function addPokemonDetailsToEvolutionPaths(evolutionPaths) {
  let pokemonNames = getUniquePokemonNamesFromEvolutionPaths(evolutionPaths);

  for (let nameIndex = 0; nameIndex < pokemonNames.length; nameIndex++) {
    await getPokemonDetailsByNameCached(pokemonNames[nameIndex]);
  }

  for (let pathIndex = 0; pathIndex < evolutionPaths.length; pathIndex++) {
    let path = evolutionPaths[pathIndex];

    for (let stepIndex = 0; stepIndex < path.length; stepIndex++) {
      let pokemonName = path[stepIndex].name;
      path[stepIndex].pokemon = pokemonDetailsCache[pokemonName];
    }
  }
}

function getUniquePokemonNamesFromEvolutionPaths(evolutionPaths) {
  let pokemonNames = [];

  for (let pathIndex = 0; pathIndex < evolutionPaths.length; pathIndex++) {
    let path = evolutionPaths[pathIndex];

    for (let stepIndex = 0; stepIndex < path.length; stepIndex++) {
      let pokemonName = path[stepIndex].name;

      if (!pokemonNames.includes(pokemonName)) {
        pokemonNames.push(pokemonName);
      }
    }
  }

  return pokemonNames;
}

async function getPokemonDetailsByNameCached(pokemonName) {
  if (pokemonDetailsCache[pokemonName]) {
    return pokemonDetailsCache[pokemonName];
  }

  let loadedPokemon = getLoadedPokemonDetailsByName(pokemonName);

  if (loadedPokemon) {
    pokemonDetailsCache[pokemonName] = loadedPokemon;
    return loadedPokemon;
  }

  let pokemon = await fetchPokemonDetailsByName(pokemonName);
  pokemonDetailsCache[pokemonName] = pokemon;

  return pokemon;
}

function getLoadedPokemonDetailsByName(pokemonName) {
  for (
    let pokemonIndex = 0;
    pokemonIndex < pokemonDetails.length;
    pokemonIndex++
  ) {
    if (pokemonDetails[pokemonIndex].name === pokemonName) {
      return pokemonDetails[pokemonIndex];
    }
  }

  return null;
}

function getEvolutionConditionText(evolutionDetails) {
  if (!evolutionDetails) {
    return "Evolution";
  }

  if (evolutionDetails.min_level) {
    return `Lv. ${evolutionDetails.min_level}`;
  }

  if (evolutionDetails.item) {
    return formatPokemonText(evolutionDetails.item.name);
  }

  if (evolutionDetails.trigger && evolutionDetails.trigger.name === "trade") {
    return "Trade";
  }

  if (evolutionDetails.min_happiness) {
    return `Happiness ${evolutionDetails.min_happiness}`;
  }

  if (evolutionDetails.time_of_day) {
    return formatPokemonText(evolutionDetails.time_of_day);
  }

  if (evolutionDetails.trigger) {
    return formatPokemonText(evolutionDetails.trigger.name);
  }

  return "Evolution";
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
  let nextOffset = currentOffset + POKEMON_LIMIT;

  renderLoadMoreButtonLoading();
  hideLoadMoreError();

  try {
    currentOffset = nextOffset;

    let pokemonList = await fetchPokemonList();
    let newPokemon = pokemonList.results;
    let newPokemonDetails = await loadNewPokemonDetails(newPokemon);

    allPokemon = allPokemon.concat(newPokemon);
    pokemonDetails = pokemonDetails.concat(newPokemonDetails);

    handlePokemonSearch();
  } catch (error) {
    console.error("More Pokemon could not be loaded:", error);
    currentOffset -= POKEMON_LIMIT;
    showLoadMoreError();
  } finally {
    renderLoadMoreButtonDefault();
  }
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

  for (let statIndex = 0; statIndex < pokemon.stats.length; statIndex++) {
    let statValue = pokemon.stats[statIndex].base_stat;

    if (statValue > maxStatValue) {
      maxStatValue = statValue;
    }
  }

  return maxStatValue;
}