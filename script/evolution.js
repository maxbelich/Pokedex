async function loadPokemonEvolution(pokemonIndex) {
  const pokemon = pokemonDetails[pokemonIndex];
  const pokemonName = pokemon.name;

  if (evolutionCache[pokemonName]) {
    return evolutionCache[pokemonName];
  }

  const speciesData = await fetchPokemonSpecies(pokemonName);

  const evolutionData = await fetchEvolutionChain(
    speciesData.evolution_chain.url,
  );

  const evolutionPaths = getEvolutionPathsFromChain(evolutionData.chain);

  await addPokemonDetailsToEvolutionPaths(evolutionPaths);

  cacheEvolutionPathsForAllPokemon(evolutionPaths);

  return evolutionPaths;
}

function cacheEvolutionPathsForAllPokemon(evolutionPaths) {
  const pokemonNames = getUniquePokemonNamesFromEvolutionPaths(evolutionPaths);

  for (let nameIndex = 0; nameIndex < pokemonNames.length; nameIndex++) {
    const pokemonName = pokemonNames[nameIndex];

    evolutionCache[pokemonName] = evolutionPaths;
  }
}

function getEvolutionPathsFromChain(chain, conditionText = "") {
  const currentStep = {
    name: chain.species.name,
    condition: conditionText,
    pokemon: null,
  };

  if (chain.evolves_to.length === 0) {
    return [[currentStep]];
  }

  const evolutionPaths = [];

  for (
    let evolutionIndex = 0;
    evolutionIndex < chain.evolves_to.length;
    evolutionIndex++
  ) {
    const nextEvolution = chain.evolves_to[evolutionIndex];
    const evolutionDetails = nextEvolution.evolution_details[0];
    const nextConditionText = getEvolutionConditionText(evolutionDetails);

    const nextPaths = getEvolutionPathsFromChain(
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
  const pokemonNames = getUniquePokemonNamesFromEvolutionPaths(evolutionPaths);

  const pokemonDetailPromises = pokemonNames.map((pokemonName) => {
    return getPokemonDetailsByNameCached(pokemonName);
  });

  await Promise.all(pokemonDetailPromises);

  for (let pathIndex = 0; pathIndex < evolutionPaths.length; pathIndex++) {
    const path = evolutionPaths[pathIndex];

    for (let stepIndex = 0; stepIndex < path.length; stepIndex++) {
      const pokemonName = path[stepIndex].name;

      path[stepIndex].pokemon = pokemonDetailsCache[pokemonName];
    }
  }
}

function getUniquePokemonNamesFromEvolutionPaths(evolutionPaths) {
  const pokemonNames = [];

  for (let pathIndex = 0; pathIndex < evolutionPaths.length; pathIndex++) {
    const path = evolutionPaths[pathIndex];

    for (let stepIndex = 0; stepIndex < path.length; stepIndex++) {
      const pokemonName = path[stepIndex].name;

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

  const loadedPokemon = getLoadedPokemonDetailsByName(pokemonName);

  if (loadedPokemon) {
    pokemonDetailsCache[pokemonName] = loadedPokemon;

    return loadedPokemon;
  }

  const pokemon = await fetchPokemonDetailsByName(pokemonName);

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