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