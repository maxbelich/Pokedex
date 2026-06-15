let currentPokemonIndex = 0;
let currentDialogTab = "about";
let lockedScrollY = 0;
let dialogContentRequestId = 0;

function setupDialogEvents() {
  const dialogRef = document.getElementById("pokemon_dialog");

  dialogRef.addEventListener("click", closeDialogOnBackdropClick);
  dialogRef.addEventListener("cancel", handleDialogCancel);
}

function handleDialogCancel(event) {
  event.preventDefault();
  closePokemonDialog();
}

function openPokemonDialog(pokemonIndex) {
  const dialogRef = document.getElementById("pokemon_dialog");
  const isDialogAlreadyOpen = dialogRef.open;

  currentPokemonIndex = pokemonIndex;
  dialogContentRequestId++;

  if (!isDialogAlreadyOpen) prepareDialogOpen(dialogRef);

  renderPokemonDialog(dialogRef, pokemonIndex);
}

function prepareDialogOpen(dialogRef) {
  currentDialogTab = "about";
  lockedScrollY = window.scrollY;

  lockPageScroll();
  dialogRef.showModal();
}

function lockPageScroll() {
  document.body.style.setProperty(
    "--scroll-y",
    `-${lockedScrollY}px`,
  );

  document.body.classList.add("no_scroll");
}

function renderPokemonDialog(dialogRef, pokemonIndex) {
  dialogRef.innerHTML = getPokemonDialogTemplate(pokemonIndex);

  if (currentDialogTab !== "about") {
    renderDialogTab(pokemonIndex, currentDialogTab);
  }
}

function closePokemonDialog() {
  const dialogRef = document.getElementById("pokemon_dialog");

  dialogContentRequestId++;
  currentDialogTab = "about";

  unlockPageScroll();

  if (dialogRef.open) dialogRef.close();

  window.scrollTo(0, lockedScrollY);
}

function unlockPageScroll() {
  document.body.classList.remove("no_scroll");
  document.body.style.removeProperty("--scroll-y");
}

function closeDialogOnBackdropClick(event) {
  const dialogRef = document.getElementById("pokemon_dialog");

  if (event.target === dialogRef) closePokemonDialog();
}

async function renderDialogTab(pokemonIndex, tabName) {
  const requestId = ++dialogContentRequestId;

  currentDialogTab = tabName;
  updateActiveDialogTab(tabName);

  if (tabName === "about") return renderAboutTab(pokemonIndex);
  if (tabName === "stats") return renderStatsTab(pokemonIndex);

  await renderEvolutionTab(pokemonIndex, requestId);
}

function renderAboutTab(pokemonIndex) {
  getDialogTabContentRef().innerHTML =
    getDialogAboutTemplate(pokemonIndex);
}

function renderStatsTab(pokemonIndex) {
  getDialogTabContentRef().innerHTML =
    getDialogStatsTemplate(pokemonIndex);
}

async function renderEvolutionTab(pokemonIndex, requestId) {
  renderEvolutionLoading();

  try {
    const evolutionPaths =
      await loadPokemonEvolution(pokemonIndex);

    renderEvolutionResult(
      evolutionPaths,
      requestId,
      pokemonIndex,
    );
  } catch (error) {
    renderEvolutionError(error, requestId, pokemonIndex);
  }
}

function renderEvolutionLoading() {
  getDialogTabContentRef().innerHTML =
    getDialogTabLoadingTemplate();
}

function renderEvolutionResult(
  evolutionPaths,
  requestId,
  pokemonIndex,
) {
  if (!isCurrentEvolutionRequest(requestId, pokemonIndex)) return;

  getDialogTabContentRef().innerHTML =
    getDialogEvolutionTemplate(evolutionPaths);
}

function renderEvolutionError(
  error,
  requestId,
  pokemonIndex,
) {
  console.error("Pokemon evolution could not be loaded:", error);

  if (!isCurrentEvolutionRequest(requestId, pokemonIndex)) return;

  renderEvolutionErrorMessage();
}

function renderEvolutionErrorMessage() {
  getDialogTabContentRef().innerHTML =
    getDialogTabErrorTemplate(
      "Evolution data could not be loaded. Please try again later.",
    );
}

function isCurrentEvolutionRequest(requestId, pokemonIndex) {
  const dialogRef = document.getElementById("pokemon_dialog");

  return (
    dialogRef.open &&
    requestId === dialogContentRequestId &&
    pokemonIndex === currentPokemonIndex &&
    currentDialogTab === "evolution"
  );
}

function getDialogTabContentRef() {
  return document.getElementById("dialog_tab_content");
}

function updateActiveDialogTab(activeTabName) {
  document.querySelectorAll(".dialog_tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  const activeTabRef =
    document.getElementById(`dialog_tab_${activeTabName}`);

  activeTabRef.classList.add("active");
}

function showPreviousPokemon() {
  const previousPokemonIndex = getVisiblePokemonNeighbor(-1);

  openPokemonDialog(previousPokemonIndex);
}

function showNextPokemon() {
  const nextPokemonIndex = getVisiblePokemonNeighbor(1);

  openPokemonDialog(nextPokemonIndex);
}

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