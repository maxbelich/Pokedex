function getMainTemplate() {
  return /*html*/ `
    <section class="hero">
      <h1>Pokédex</h1>
      <p>Search and explore Pokémon</p>
    </section>

    <section class="pokemon_content">
      <div id="pokemon_cards"></div>
    </section>
  `;
}

function getPokemonCardTemplate(pokemonIndex) {
  return /*html*/ `
    <button 
      class="pokemon_card" 
      type="button" 
      aria-label="Open details for ${pokemonDetails[pokemonIndex].name}"
    >
      <span>#${pokemonDetails[pokemonIndex].id}</span>
      <h2>${pokemonDetails[pokemonIndex].name}</h2>
      <img src="${pokemonDetails[pokemonIndex].sprites.front_default}" alt="${pokemonDetails[pokemonIndex].name}">
      <div class="pokemon_types">
        ${getPokemonTypesTemplate(pokemonIndex)}
      </div>
    </button>
  `;
}

function getPokemonTypesTemplate(pokemonIndex) {
  let typesTemplate = "";

  for (
    let typeIndex = 0;
    typeIndex < pokemonDetails[pokemonIndex].types.length;
    typeIndex++
  ) {
    let typeName = pokemonDetails[pokemonIndex].types[typeIndex].type.name;
    let typeColor = typeColors[typeName] || "#777";

    typesTemplate += /*html*/ `
      <span class="pokemon_type" style="background-color: ${typeColor}">
        ${typeName}
      </span>
    `;
  }

  return typesTemplate;
}

function getLoadingTemplate() {
  return /*html*/ `
    <div class="loading_state">
      <img class="loading_pokeball" src="./assets/imgs/pokeball_bg.svg" alt="Loading Pokéball">
      <p class="loading_text">
        Loading Pokemon
        <span class="loading_dot">.</span>
        <span class="loading_dot">.</span>
        <span class="loading_dot">.</span>
      </p>
    </div>
  `;
}