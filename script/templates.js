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
    <div class="pokemon_card">
      <span>#${pokemonDetails[pokemonIndex].id}</span>
      <h2>${pokemonDetails[pokemonIndex].name}</h2>
      <img src="${pokemonDetails[pokemonIndex].sprites.front_default}" alt="${pokemonDetails[pokemonIndex].name}">
    </div>
  `;
}