function getMainTemplate() {
  return /*html*/ `
    <section class="hero">
      <h1>Pokédex</h1>
      <p>Search and explore Pokémon</p>
    </section>

    <section class="pokemon_content">
      <div id="pokemon_cards"></div>
    </section>

    <dialog id="pokemon_dialog" class="pokemon_dialog"></dialog>
  `;
}

function getPokemonCardTemplate(pokemonIndex) {
  return /*html*/ `
    <button 
      class="pokemon_card" 
      type="button"
      onclick="openPokemonDialog(${pokemonIndex})"
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

function getPokemonDialogTemplate(pokemonIndex) {
  let pokemon = pokemonDetails[pokemonIndex];
  let mainType = pokemon.types[0].type.name;
  let mainColor = typeColors[mainType] || "#777";

  return /*html*/ `
    <div class="pokemon_dialog_card">
      <div class="pokemon_dialog_header" style="background-color: ${mainColor}">
        <div class="pokemon_dialog_topline">
          <button class="dialog_back_btn" type="button" onclick="closePokemonDialog()" aria-label="Close dialog">
            ←
          </button>

          <h2>${pokemon.name}</h2>

          <span>#${String(pokemon.id).padStart(3, "0")}</span>
        </div>

        <img 
          class="dialog_pokemon_img"
          src="${pokemon.sprites.other["official-artwork"].front_default}" 
          alt="${pokemon.name}"
        >
      </div>

      <div class="pokemon_dialog_body">
        <div class="pokemon_types dialog_types">
          ${getPokemonTypesTemplate(pokemonIndex)}
        </div>

        <div class="dialog_tabs">
  <button 
    class="dialog_tab active" 
    id="dialog_tab_about"
    type="button" 
    onclick="renderDialogTab(${pokemonIndex}, 'about')"
  >
    About
  </button>

  <button 
    class="dialog_tab" 
    id="dialog_tab_stats"
    type="button" 
    onclick="renderDialogTab(${pokemonIndex}, 'stats')"
  >
    Stats
  </button>

  <button 
    class="dialog_tab" 
    id="dialog_tab_evolution"
    type="button" 
    onclick="renderDialogTab(${pokemonIndex}, 'evolution')"
  >
    Evolution
  </button>
</div>

<div class="dialog_tab_content" id="dialog_tab_content">
  ${getDialogAboutTemplate(pokemonIndex)}
</div>

  `;
}

function formatPokemonText(text) {
  return text
    .replace(/-/g, " ")
    .replace(/\b\w/g, (firstLetter) => firstLetter.toUpperCase());
}

function getPokemonAbilitiesTemplate(pokemon) {
  let abilities = pokemon.abilities.slice(0, 2);
  let abilitiesTemplate = "";

  for (let abilityIndex = 0; abilityIndex < abilities.length; abilityIndex++) {
    let abilityName = abilities[abilityIndex].ability.name;

    abilitiesTemplate += /*html*/ `
      <span>${formatPokemonText(abilityName)}</span>
    `;
  }

  return abilitiesTemplate;
}

function getDialogAboutTemplate(pokemonIndex) {
  let pokemon = pokemonDetails[pokemonIndex];

  return /*html*/ `
    <div class="pokemon_about_infos">
      <div class="pokemon_about_item">
        <img src="./assets/icons/height.svg" alt="">
        <span>${pokemon.height / 10} m</span>
        <small>Height</small>
      </div>

      <div class="pokemon_about_item">
        <img src="./assets/icons/weight.svg" alt="">
        <span>${pokemon.weight / 10} kg</span>
        <small>Weight</small>
      </div>

      <div class="pokemon_about_item">
        <img src="./assets/icons/ability.png" alt="">
        <div class="pokemon_abilities_list">
          ${getPokemonAbilitiesTemplate(pokemon)}
        </div>
        <small>Abilities</small>
      </div>
    </div>
  `;
}

function getDialogStatsTemplate(pokemonIndex) {
  let pokemon = pokemonDetails[pokemonIndex];
  let mainType = pokemon.types[0].type.name;
  let mainColor = typeColors[mainType] || "#777";
  let statsTemplate = "";

  for (let statIndex = 0; statIndex < pokemon.stats.length; statIndex++) {
    let statName = formatPokemonStatName(pokemon.stats[statIndex].stat.name);
    let statValue = pokemon.stats[statIndex].base_stat;
    let statBarWidth = Math.min(statValue, 100);

    statsTemplate += /*html*/ `
      <div class="pokemon_stat_row">
        <span class="pokemon_stat_name">${statName}</span>
        <span class="pokemon_stat_value">${statValue}</span>

        <div class="pokemon_stat_bar">
          <div 
            class="pokemon_stat_bar_fill" 
            style="width: ${statBarWidth}%; background-color: ${mainColor};"
          ></div>
        </div>
      </div>
    `;
  }

  return /*html*/ `
    <div class="pokemon_stats">
      ${statsTemplate}
    </div>
  `;
}

function formatPokemonStatName(statName) {
  if (statName === "hp") {
    return "HP";
  }

  if (statName === "special-attack") {
    return "Sp. Atk";
  }

  if (statName === "special-defense") {
    return "Sp. Def";
  }

  return formatPokemonText(statName);
}

function getDialogEvolutionTemplate() {
  return /*html*/ `
    <div class="pokemon_evolution_placeholder">
      <p>Evolution data coming soon.</p>
    </div>
  `;
}