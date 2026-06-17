# 🔴 Pokédex

A responsive Pokédex web app built with **HTML**, **CSS** and **JavaScript**.
The app uses the **PokéAPI** to load Pokémon data, display Pokémon cards, search already loaded Pokémon and show detailed information in an interactive dialog.

---

## 🚀 Live Demo

[View live demo](https://maxbelich.developerakademie.net/Pokedex/index.html)

---

## ✨ Features

* 🔎 Search Pokémon by name or ID
* 🔢 Supports ID inputs like `6`, `006` and `#006`
* 📦 Loads an initial Pokémon batch from the PokéAPI
* ➕ Loads more Pokémon with a **Load More** button
* ⏳ Shows loading states while data is being fetched
* ⚠️ Handles API errors and empty search results
* 🧠 Uses caching for evolution chains and Pokémon details
* 💤 Lazy loads evolution data only when needed
* 🃏 Displays responsive Pokémon cards
* 📖 Opens a detailed Pokémon dialog
* 📊 Shows base stats with visual stat bars
* 🌱 Shows evolution chains, including multiple evolution paths
* ⬅️➡️ Supports previous and next navigation inside the dialog
* 📱 Fully responsive layout for desktop, tablet and mobile

---

## 🛠️ Tech Stack

* HTML5
* CSS3
* JavaScript
* PokéAPI
* Git
* GitHub

---

## 🌐 API

This project uses the public [PokéAPI](https://pokeapi.co/) to fetch Pokémon data.

Used API data includes:

* Pokémon list data
* Pokémon detail data
* Pokémon species data
* Evolution chain data

---

## 📁 Project Structure

```txt
.
├── index.html
├── imprint.html
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── imgs/
├── script/
│   ├── api.js
│   ├── config.js
│   ├── data.js
│   ├── dialog.js
│   ├── evolution.js
│   ├── search.js
│   ├── script.js
│   └── templates.js
└── style/
    ├── fonts.css
    ├── reset.css
    ├── responsive.css
    ├── style.css
    └── variables.css
```

---

## 🧩 Main Concepts

### 🔄 Fetch then Render

The app first loads the required Pokémon data and renders the UI only after the data is available.

### 💤 Lazy Loading

Evolution data is not loaded during the initial page load.
It is fetched only when the user opens the **Evolution** tab inside the Pokémon dialog.

### 🧠 Caching

Already loaded evolution chains and Pokémon details are stored in cache objects.
This avoids unnecessary API requests when the same data is needed again.

### 🔎 Search

The search works only with Pokémon that have already been loaded into the app.
Name search starts from three characters. ID search works with exact IDs.

---

## 🧠 What I Learned

During this project I practiced:

* Working with a public API
* Using `fetch`, `async` and `await`
* Handling errors with `try/catch`
* Loading multiple requests with `Promise.all`
* Managing global app state
* Separating JavaScript into multiple files
* Building reusable template functions
* Implementing lazy loading
* Implementing caching
* Creating loading, error and empty states
* Building responsive layouts

---

## 💻 Installation

Clone the repository:

```bash
git clone https://github.com/maxbelich/Pokedex.git
```

Open the project folder:

```bash
cd Pokedex
```

Open `index.html` in your browser.

No build step is required.

---

## 📝 Notes

This project was created as a portfolio project during my Fullstack Developer training.

Pokémon data is provided by [PokéAPI](https://pokeapi.co/).
This project is not affiliated with Nintendo, Game Freak, The Pokémon Company or PokéAPI.

---

## 👤 Author

Max Belich

---

## 📄 License

This project is for educational purposes.
