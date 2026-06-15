/** Loads, builds and caches Pokémon evolution chains.
 Evolution data is loaded only when the evolution tab is opened. */

/** Loads the evolution paths for one Pokémon and returns cached data if available. */
async function loadPokemonEvolution(pokemonIndex) {
  const pokemonName = pokemonDetails[pokemonIndex].name;

  if (evolutionCache[pokemonName]) return evolutionCache[pokemonName];

  const evolutionPaths = await fetchPokemonEvolutionPaths(pokemonName);
  await addPokemonDetailsToEvolutionPaths(evolutionPaths);
  cacheEvolutionPathsForAllPokemon(evolutionPaths);

  return evolutionPaths;
}

/** Fetches species and evolution-chain data, then converts it into renderable paths. */
async function fetchPokemonEvolutionPaths(pokemonName) {
  const speciesData = await fetchPokemonSpecies(pokemonName);
  const evolutionUrl = speciesData.evolution_chain.url;
  const evolutionData = await fetchEvolutionChain(evolutionUrl);

  return getEvolutionPathsFromChain(evolutionData.chain);
}

/** Stores the same evolution paths for every Pokémon name inside that chain. */
function cacheEvolutionPathsForAllPokemon(evolutionPaths) {
  const pokemonNames = getUniquePokemonNamesFromEvolutionPaths(evolutionPaths);

  for (let index = 0; index < pokemonNames.length; index++) {
    evolutionCache[pokemonNames[index]] = evolutionPaths;
  }
}

/** Recursively converts the nested API evolution chain into separate evolution paths. */
function getEvolutionPathsFromChain(chain, conditionText = "") {
  const currentStep = createEvolutionStep(chain, conditionText);

  if (chain.evolves_to.length === 0) return [[currentStep]];

  return buildNextEvolutionPaths(chain.evolves_to, currentStep);
}

/** Creates one evolution step with name, condition text and placeholder details. */
function createEvolutionStep(chain, conditionText) {
  return {
    name: chain.species.name,
    condition: conditionText,
    pokemon: null,
  };
}

/** Builds all following evolution paths for one step in the chain. */
function buildNextEvolutionPaths(nextEvolutions, currentStep) {
  const evolutionPaths = [];

  for (let index = 0; index < nextEvolutions.length; index++) {
    const nextPaths = getNextEvolutionPaths(nextEvolutions[index]);
    prependCurrentStep(evolutionPaths, nextPaths, currentStep);
  }

  return evolutionPaths;
}

/** Gets all paths that continue from the next evolution step. */
function getNextEvolutionPaths(nextEvolution) {
  const evolutionDetails = nextEvolution.evolution_details[0];
  const conditionText = getEvolutionConditionText(evolutionDetails);

  return getEvolutionPathsFromChain(nextEvolution, conditionText);
}

/** Adds the current step in front of each following evolution path. */
function prependCurrentStep(targetPaths, nextPaths, currentStep) {
  for (let index = 0; index < nextPaths.length; index++) {
    targetPaths.push([currentStep].concat(nextPaths[index]));
  }
}

/** Loads missing Pokémon details and assigns them to every evolution step. */
async function addPokemonDetailsToEvolutionPaths(evolutionPaths) {
  const pokemonNames = getUniquePokemonNamesFromEvolutionPaths(evolutionPaths);

  await loadEvolutionPokemonDetails(pokemonNames);
  assignPokemonDetailsToEvolutionPaths(evolutionPaths);
}

/** Loads all required Pokémon details in parallel and uses cached data when possible. */
async function loadEvolutionPokemonDetails(pokemonNames) {
  const detailPromises = pokemonNames.map((pokemonName) => {
    return getPokemonDetailsByNameCached(pokemonName);
  });

  await Promise.all(detailPromises);
}

/** Assigns cached Pokémon details to all evolution paths. */
function assignPokemonDetailsToEvolutionPaths(evolutionPaths) {
  for (let index = 0; index < evolutionPaths.length; index++) {
    assignPokemonDetailsToPath(evolutionPaths[index]);
  }
}

/** Assigns cached Pokémon details to every step in one evolution path. */
function assignPokemonDetailsToPath(evolutionPath) {
  for (let index = 0; index < evolutionPath.length; index++) {
    const evolutionStep = evolutionPath[index];

    evolutionStep.pokemon = pokemonDetailsCache[evolutionStep.name];
  }
}

/** Collects every Pokémon name from all evolution paths without duplicates. */
function getUniquePokemonNamesFromEvolutionPaths(evolutionPaths) {
  const pokemonNames = [];

  for (let index = 0; index < evolutionPaths.length; index++) {
    addUniquePokemonNames(evolutionPaths[index], pokemonNames);
  }

  return pokemonNames;
}

/** Adds Pokémon names from one path to the list if they are not already included. */
function addUniquePokemonNames(evolutionPath, pokemonNames) {
  for (let index = 0; index < evolutionPath.length; index++) {
    const pokemonName = evolutionPath[index].name;

    if (!pokemonNames.includes(pokemonName)) {
      pokemonNames.push(pokemonName);
    }
  }
}

/** Returns Pokémon details from cache or loads them if they are missing. */
async function getPokemonDetailsByNameCached(pokemonName) {
  if (pokemonDetailsCache[pokemonName]) {
    return pokemonDetailsCache[pokemonName];
  }

  const pokemon = await getOrFetchPokemonDetails(pokemonName);
  pokemonDetailsCache[pokemonName] = pokemon;

  return pokemon;
}

/** Reuses already loaded card data before making a new API request. */
async function getOrFetchPokemonDetails(pokemonName) {
  const loadedPokemon = getLoadedPokemonDetailsByName(pokemonName);

  if (loadedPokemon) return loadedPokemon;

  return fetchPokemonDetailsByName(pokemonName);
}

/** Finds Pokémon details inside the already loaded main Pokémon list. */
function getLoadedPokemonDetailsByName(pokemonName) {
  for (let index = 0; index < pokemonDetails.length; index++) {
    if (pokemonDetails[index].name === pokemonName) {
      return pokemonDetails[index];
    }
  }

  return null;
}

/** Returns the first supported evolution condition text from the API details. */
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

/** Returns a level condition if the evolution requires a minimum level. */
function getLevelConditionText(evolutionDetails) {
  if (!evolutionDetails.min_level) return "";

  return `Lv. ${evolutionDetails.min_level}`;
}

/** Returns an item condition if the evolution requires an item. */
function getItemConditionText(evolutionDetails) {
  if (!evolutionDetails.item) return "";

  return formatPokemonText(evolutionDetails.item.name);
}

/** Returns a trade condition if the evolution is triggered by trading. */
function getTradeConditionText(evolutionDetails) {
  if (!evolutionDetails.trigger) return "";
  if (evolutionDetails.trigger.name !== "trade") return "";

  return "Trade";
}

/** Returns a happiness condition if the evolution requires minimum happiness. */
function getHappinessConditionText(evolutionDetails) {
  if (!evolutionDetails.min_happiness) return "";

  return `Happiness ${evolutionDetails.min_happiness}`;
}

/** Returns a time condition if the evolution depends on time of day. */
function getTimeConditionText(evolutionDetails) {
  if (!evolutionDetails.time_of_day) return "";

  return formatPokemonText(evolutionDetails.time_of_day);
}

/** Returns the general trigger name if no more specific condition matched. */
function getTriggerConditionText(evolutionDetails) {
  if (!evolutionDetails.trigger) return "";

  return formatPokemonText(evolutionDetails.trigger.name);
}

/** Builds all evolution path templates for the dialog. */
function getEvolutionPathsTemplate(evolutionPaths) {
  let evolutionTemplate = "";

  for (let pathIndex = 0; pathIndex < evolutionPaths.length; pathIndex++) {
    evolutionTemplate += getEvolutionPathTemplate(evolutionPaths[pathIndex]);
  }

  return evolutionTemplate;
}

/** Builds one complete evolution path template. */
function getEvolutionPathTemplate(evolutionPath) {
  let pathTemplate = "";

  for (let stepIndex = 0; stepIndex < evolutionPath.length; stepIndex++) {
    const evolutionStep = evolutionPath[stepIndex];

    if (stepIndex > 0) {
      pathTemplate += getEvolutionConditionTemplate(evolutionStep.condition);
    }

    pathTemplate += getEvolutionPokemonTemplate(evolutionStep);
  }

  return getEvolutionPathContainerTemplate(pathTemplate);
}