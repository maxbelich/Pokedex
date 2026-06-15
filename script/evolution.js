async function loadPokemonEvolution(pokemonIndex) {
  const pokemonName = pokemonDetails[pokemonIndex].name;

  if (evolutionCache[pokemonName]) return evolutionCache[pokemonName];

  const evolutionPaths = await fetchPokemonEvolutionPaths(pokemonName);
  await addPokemonDetailsToEvolutionPaths(evolutionPaths);
  cacheEvolutionPathsForAllPokemon(evolutionPaths);

  return evolutionPaths;
}

async function fetchPokemonEvolutionPaths(pokemonName) {
  const speciesData = await fetchPokemonSpecies(pokemonName);
  const evolutionUrl = speciesData.evolution_chain.url;
  const evolutionData = await fetchEvolutionChain(evolutionUrl);

  return getEvolutionPathsFromChain(evolutionData.chain);
}

function cacheEvolutionPathsForAllPokemon(evolutionPaths) {
  const pokemonNames = getUniquePokemonNamesFromEvolutionPaths(evolutionPaths);

  for (let index = 0; index < pokemonNames.length; index++) {
    evolutionCache[pokemonNames[index]] = evolutionPaths;
  }
}

function getEvolutionPathsFromChain(chain, conditionText = "") {
  const currentStep = createEvolutionStep(chain, conditionText);

  if (chain.evolves_to.length === 0) return [[currentStep]];

  return buildNextEvolutionPaths(chain.evolves_to, currentStep);
}

function createEvolutionStep(chain, conditionText) {
  return {
    name: chain.species.name,
    condition: conditionText,
    pokemon: null,
  };
}

function buildNextEvolutionPaths(nextEvolutions, currentStep) {
  const evolutionPaths = [];

  for (let index = 0; index < nextEvolutions.length; index++) {
    const nextPaths = getNextEvolutionPaths(nextEvolutions[index]);
    prependCurrentStep(evolutionPaths, nextPaths, currentStep);
  }

  return evolutionPaths;
}

function getNextEvolutionPaths(nextEvolution) {
  const evolutionDetails = nextEvolution.evolution_details[0];
  const conditionText = getEvolutionConditionText(evolutionDetails);

  return getEvolutionPathsFromChain(nextEvolution, conditionText);
}

function prependCurrentStep(targetPaths, nextPaths, currentStep) {
  for (let index = 0; index < nextPaths.length; index++) {
    targetPaths.push([currentStep].concat(nextPaths[index]));
  }
}

async function addPokemonDetailsToEvolutionPaths(evolutionPaths) {
  const pokemonNames = getUniquePokemonNamesFromEvolutionPaths(evolutionPaths);

  await loadEvolutionPokemonDetails(pokemonNames);
  assignPokemonDetailsToEvolutionPaths(evolutionPaths);
}

async function loadEvolutionPokemonDetails(pokemonNames) {
  const detailPromises = pokemonNames.map((pokemonName) => {
    return getPokemonDetailsByNameCached(pokemonName);
  });

  await Promise.all(detailPromises);
}

function assignPokemonDetailsToEvolutionPaths(evolutionPaths) {
  for (let index = 0; index < evolutionPaths.length; index++) {
    assignPokemonDetailsToPath(evolutionPaths[index]);
  }
}

function assignPokemonDetailsToPath(evolutionPath) {
  for (let index = 0; index < evolutionPath.length; index++) {
    const evolutionStep = evolutionPath[index];

    evolutionStep.pokemon = pokemonDetailsCache[evolutionStep.name];
  }
}

function getUniquePokemonNamesFromEvolutionPaths(evolutionPaths) {
  const pokemonNames = [];

  for (let index = 0; index < evolutionPaths.length; index++) {
    addUniquePokemonNames(evolutionPaths[index], pokemonNames);
  }

  return pokemonNames;
}

function addUniquePokemonNames(evolutionPath, pokemonNames) {
  for (let index = 0; index < evolutionPath.length; index++) {
    const pokemonName = evolutionPath[index].name;

    if (!pokemonNames.includes(pokemonName)) {
      pokemonNames.push(pokemonName);
    }
  }
}

async function getPokemonDetailsByNameCached(pokemonName) {
  if (pokemonDetailsCache[pokemonName]) {
    return pokemonDetailsCache[pokemonName];
  }

  const pokemon = await getOrFetchPokemonDetails(pokemonName);
  pokemonDetailsCache[pokemonName] = pokemon;

  return pokemon;
}

async function getOrFetchPokemonDetails(pokemonName) {
  const loadedPokemon = getLoadedPokemonDetailsByName(pokemonName);

  if (loadedPokemon) return loadedPokemon;

  return fetchPokemonDetailsByName(pokemonName);
}

function getLoadedPokemonDetailsByName(pokemonName) {
  for (let index = 0; index < pokemonDetails.length; index++) {
    if (pokemonDetails[index].name === pokemonName) {
      return pokemonDetails[index];
    }
  }

  return null;
}

function getEvolutionConditionText(evolutionDetails) {
  if (!evolutionDetails) return "Evolution";

  return (
    getLevelConditionText(evolutionDetails) ||
    getItemConditionText(evolutionDetails) ||
    getTradeConditionText(evolutionDetails) ||
    getHappinessConditionText(evolutionDetails) ||
    getTimeConditionText(evolutionDetails) ||
    getTriggerConditionText(evolutionDetails) ||
    "Evolution"
  );
}

function getLevelConditionText(evolutionDetails) {
  if (!evolutionDetails.min_level) return "";

  return `Lv. ${evolutionDetails.min_level}`;
}

function getItemConditionText(evolutionDetails) {
  if (!evolutionDetails.item) return "";

  return formatPokemonText(evolutionDetails.item.name);
}

function getTradeConditionText(evolutionDetails) {
  if (!evolutionDetails.trigger) return "";
  if (evolutionDetails.trigger.name !== "trade") return "";

  return "Trade";
}

function getHappinessConditionText(evolutionDetails) {
  if (!evolutionDetails.min_happiness) return "";

  return `Happiness ${evolutionDetails.min_happiness}`;
}

function getTimeConditionText(evolutionDetails) {
  if (!evolutionDetails.time_of_day) return "";

  return formatPokemonText(evolutionDetails.time_of_day);
}

function getTriggerConditionText(evolutionDetails) {
  if (!evolutionDetails.trigger) return "";

  return formatPokemonText(evolutionDetails.trigger.name);
}