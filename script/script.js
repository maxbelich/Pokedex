let currentPokemonIndex = 0;
let currentDialogTab = "about";
let lockedScrollY = 0;
let dialogContentRequestId = 0;

async function init() {
  renderMain();
  setupDialogEvents();
  hideLoadMoreButton();
  renderLoadingState();

  try {
    const pokemonList = await fetchPokemonList(POKEMON_LIMIT, currentOffset);

    allPokemon = pokemonList.results;

    await loadPokemonDetails();

    renderPokemonCards();

    if (pokemonDetails.length < MAX_POKEMON_ID) {
      showLoadMoreButton();
    }
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

function setupDialogEvents() {
  const dialogRef = document.getElementById("pokemon_dialog");

  dialogRef.addEventListener("click", closeDialogOnBackdropClick);
  dialogRef.addEventListener("cancel", handleDialogCancel);
}

function handleDialogCancel(event) {
  event.preventDefault();

  closePokemonDialog();
}

function renderPokemonCards(pokemonIndexes = getAllPokemonIndexes()) {
  const pokemonCardsRef = document.getElementById("pokemon_cards");

  if (pokemonIndexes.length === 0) {
    pokemonCardsRef.innerHTML = getNoPokemonFoundTemplate();
    return;
  }

  let pokemonCardsTemplate = "";

  for (let index = 0; index < pokemonIndexes.length; index++) {
    const pokemonIndex = pokemonIndexes[index];

    pokemonCardsTemplate += getPokemonCardTemplate(pokemonIndex);
  }

  pokemonCardsRef.innerHTML = pokemonCardsTemplate;
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

function openPokemonDialog(pokemonIndex) {
  const dialogRef = document.getElementById("pokemon_dialog");
  const isDialogAlreadyOpen = dialogRef.open;

  currentPokemonIndex = pokemonIndex;

  dialogContentRequestId++;

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
}

function closePokemonDialog() {
  const dialogRef = document.getElementById("pokemon_dialog");

  dialogContentRequestId++;
  currentDialogTab = "about";

  document.body.classList.remove("no_scroll");
  document.body.style.removeProperty("--scroll-y");

  if (dialogRef.open) {
    dialogRef.close();
  }

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

  const requestId = ++dialogContentRequestId;

  currentDialogTab = tabName;

  updateActiveDialogTab(tabName);

  if (tabName === "about") {
    tabContentRef.innerHTML = getDialogAboutTemplate(pokemonIndex);

    return;
  }

  if (tabName === "stats") {
    tabContentRef.innerHTML = getDialogStatsTemplate(pokemonIndex);

    return;
  }

  if (tabName === "evolution") {
    tabContentRef.innerHTML = getDialogTabLoadingTemplate();

    try {
      const evolutionPaths = await loadPokemonEvolution(pokemonIndex);

      if (!isCurrentDialogContentRequest(requestId, pokemonIndex, tabName)) {
        return;
      }

      const currentTabContentRef =
        document.getElementById("dialog_tab_content");

      currentTabContentRef.innerHTML =
        getDialogEvolutionTemplate(evolutionPaths);
    } catch (error) {
      console.error("Pokemon evolution could not be loaded:", error);

      if (!isCurrentDialogContentRequest(requestId, pokemonIndex, tabName)) {
        return;
      }

      const currentTabContentRef =
        document.getElementById("dialog_tab_content");

      currentTabContentRef.innerHTML = getDialogTabErrorTemplate(
        "Evolution data could not be loaded. Please try again later.",
      );
    }
  }
}

function isCurrentDialogContentRequest(requestId, pokemonIndex, tabName) {
  const dialogRef = document.getElementById("pokemon_dialog");

  return (
    dialogRef.open &&
    requestId === dialogContentRequestId &&
    pokemonIndex === currentPokemonIndex &&
    tabName === currentDialogTab
  );
}

function updateActiveDialogTab(activeTabName) {
  document.querySelectorAll(".dialog_tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  document
    .getElementById(`dialog_tab_${activeTabName}`)
    .classList.add("active");
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
  const nextOffset = currentOffset + POKEMON_LIMIT;

  if (nextOffset >= MAX_POKEMON_ID) {
    hideLoadMoreButton();
    return;
  }

  const remainingPokemon = MAX_POKEMON_ID - nextOffset;
  const nextLimit = Math.min(POKEMON_LIMIT, remainingPokemon);

  renderLoadMoreButtonLoading();
  hideLoadMoreError();

  try {
    const pokemonList = await fetchPokemonList(nextLimit, nextOffset);

    const newPokemon = pokemonList.results;
    const newPokemonDetails = await loadNewPokemonDetails(newPokemon);

    allPokemon = allPokemon.concat(newPokemon);
    pokemonDetails = pokemonDetails.concat(newPokemonDetails);

    currentOffset = nextOffset;

    handlePokemonSearch();

    if (pokemonDetails.length >= MAX_POKEMON_ID) {
      hideLoadMoreButton();
    }
  } catch (error) {
    console.error("More Pokemon could not be loaded:", error);

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
    const statValue = pokemon.stats[statIndex].base_stat;

    if (statValue > maxStatValue) {
      maxStatValue = statValue;
    }
  }

  return maxStatValue;
}