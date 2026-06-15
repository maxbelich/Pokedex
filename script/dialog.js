/**
 * Handles the Pokémon detail dialog, including open/close behavior,
 * tab rendering, scroll locking and navigation within the visible card list.
 */

let currentPokemonIndex = 0;
let currentDialogTab = "about";
let lockedScrollY = 0;
let dialogContentRequestId = 0;

/** Adds the dialog events for backdrop click and Escape key handling. */
function setupDialogEvents() {
  const dialogRef = document.getElementById("pokemon_dialog");

  dialogRef.addEventListener("click", closeDialogOnBackdropClick);
  dialogRef.addEventListener("cancel", handleDialogCancel);
}

/** Prevents the native dialog close and uses the custom close logic instead. */
function handleDialogCancel(event) {
  event.preventDefault();
  closePokemonDialog();
}

/** Opens the dialog or updates its content when navigating between Pokémon. */
function openPokemonDialog(pokemonIndex) {
  const dialogRef = document.getElementById("pokemon_dialog");
  const isDialogAlreadyOpen = dialogRef.open;

  currentPokemonIndex = pokemonIndex;
  dialogContentRequestId++;

  if (!isDialogAlreadyOpen) prepareDialogOpen(dialogRef);

  renderPokemonDialog(dialogRef, pokemonIndex);
}

/** Prepares the dialog state before opening it for the first time. */
function prepareDialogOpen(dialogRef) {
  currentDialogTab = "about";
  lockedScrollY = window.scrollY;

  lockPageScroll();
  dialogRef.showModal();
}

/** Locks the page scroll while the dialog is open. */
function lockPageScroll() {
  document.body.style.setProperty("--scroll-y", `-${lockedScrollY}px`);

  document.body.classList.add("no_scroll");
}

/** Renders the dialog content and keeps the active tab while navigating. */
function renderPokemonDialog(dialogRef, pokemonIndex) {
  dialogRef.innerHTML = getPokemonDialogTemplate(pokemonIndex);

  if (currentDialogTab !== "about") {
    renderDialogTab(pokemonIndex, currentDialogTab);
  }
}

/** Closes the dialog, resets tab state and restores the previous scroll position. */
function closePokemonDialog() {
  const dialogRef = document.getElementById("pokemon_dialog");

  dialogContentRequestId++;
  currentDialogTab = "about";

  unlockPageScroll();

  if (dialogRef.open) dialogRef.close();

  window.scrollTo(0, lockedScrollY);
}

/** Restores normal page scrolling after the dialog has closed. */
function unlockPageScroll() {
  document.body.classList.remove("no_scroll");
  document.body.style.removeProperty("--scroll-y");
}

/** Closes the dialog when the user clicks on the backdrop area. */
function closeDialogOnBackdropClick(event) {
  const dialogRef = document.getElementById("pokemon_dialog");

  if (event.target === dialogRef) closePokemonDialog();
}

/** Renders the selected dialog tab and starts async loading for evolution data. */
async function renderDialogTab(pokemonIndex, tabName) {
  const requestId = ++dialogContentRequestId;

  currentDialogTab = tabName;
  updateActiveDialogTab(tabName);

  if (tabName === "about") return renderAboutTab(pokemonIndex);
  if (tabName === "stats") return renderStatsTab(pokemonIndex);

  await renderEvolutionTab(pokemonIndex, requestId);
}

/** Renders the about tab content. */
function renderAboutTab(pokemonIndex) {
  getDialogTabContentRef().innerHTML = getDialogAboutTemplate(pokemonIndex);
}

/** Renders the stats tab content. */
function renderStatsTab(pokemonIndex) {
  getDialogTabContentRef().innerHTML = getDialogStatsTemplate(pokemonIndex);
}

/** Loads and renders the evolution tab content. */
async function renderEvolutionTab(pokemonIndex, requestId) {
  renderEvolutionLoading();

  try {
    const evolutionPaths = await loadPokemonEvolution(pokemonIndex);

    renderEvolutionResult(evolutionPaths, requestId, pokemonIndex);
  } catch (error) {
    renderEvolutionError(error, requestId, pokemonIndex);
  }
}

/** Shows a loading state while evolution data is being loaded. */
function renderEvolutionLoading() {
  getDialogTabContentRef().innerHTML = getDialogTabLoadingTemplate();
}

/** Renders evolution data if the request still belongs to the active dialog state. */
function renderEvolutionResult(evolutionPaths, requestId, pokemonIndex) {
  if (!isCurrentEvolutionRequest(requestId, pokemonIndex)) return;

  getDialogTabContentRef().innerHTML =
    getDialogEvolutionTemplate(evolutionPaths);
}

/** Handles failed evolution requests without overwriting newer dialog content. */
function renderEvolutionError(error, requestId, pokemonIndex) {
  console.error("Pokemon evolution could not be loaded:", error);

  if (!isCurrentEvolutionRequest(requestId, pokemonIndex)) return;

  renderEvolutionErrorMessage();
}

/** Shows an error message inside the evolution tab. */
function renderEvolutionErrorMessage() {
  getDialogTabContentRef().innerHTML = getDialogTabErrorTemplate(
    "Evolution data could not be loaded. Please try again later.",
  );
}

/** Checks whether an async evolution request still matches the current dialog state. */
function isCurrentEvolutionRequest(requestId, pokemonIndex) {
  const dialogRef = document.getElementById("pokemon_dialog");

  return (
    dialogRef.open &&
    requestId === dialogContentRequestId &&
    pokemonIndex === currentPokemonIndex &&
    currentDialogTab === "evolution"
  );
}

/** Returns the current tab content container inside the dialog. */
function getDialogTabContentRef() {
  return document.getElementById("dialog_tab_content");
}

/** Updates the active visual state of the dialog tab buttons. */
function updateActiveDialogTab(activeTabName) {
  document.querySelectorAll(".dialog_tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  const activeTabRef = document.getElementById(`dialog_tab_${activeTabName}`);

  activeTabRef.classList.add("active");
}

/** Opens the previous Pokémon within the currently visible card list. */
function showPreviousPokemon() {
  const previousPokemonIndex = getVisiblePokemonNeighbor(-1);

  openPokemonDialog(previousPokemonIndex);
}

/** Opens the next Pokémon within the currently visible card list. */
function showNextPokemon() {
  const nextPokemonIndex = getVisiblePokemonNeighbor(1);

  openPokemonDialog(nextPokemonIndex);
}

/** Finds the next or previous Pokémon based on the current visible cards. */
function getVisiblePokemonNeighbor(direction) {
  const currentVisibleIndex =
    visiblePokemonIndexes.indexOf(currentPokemonIndex);

  if (currentVisibleIndex === -1) return currentPokemonIndex;

  const nextVisibleIndex = getWrappedVisiblePokemonIndex(
    currentVisibleIndex,
    direction,
  );

  return visiblePokemonIndexes[nextVisibleIndex];
}

/** Wraps dialog navigation from the end to the start or from the start to the end. */
function getWrappedVisiblePokemonIndex(currentVisibleIndex, direction) {
  let nextVisibleIndex = currentVisibleIndex + direction;

  if (nextVisibleIndex < 0) {
    return visiblePokemonIndexes.length - 1;
  }

  if (nextVisibleIndex >= visiblePokemonIndexes.length) {
    return 0;
  }

  return nextVisibleIndex;
}
