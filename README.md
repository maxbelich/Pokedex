# 🔴 Pokédex

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![REST API](https://img.shields.io/badge/REST_API-0B0F0E?style=for-the-badge&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

Responsive Pokédex web application built with HTML, CSS and Vanilla JavaScript.

The app uses the public PokéAPI to load Pokémon data dynamically, provide search and detailed views, and fetch evolution information only when it is actually needed.

**Live:** [pokedex.maxbelich.de](https://pokedex.maxbelich.de/)

## ✨ Features

* 🔎 Search Pokémon by name or ID
* 🔢 Supports ID inputs such as `6`, `006` and `#006`
* 📦 Loads Pokémon data in batches from the PokéAPI
* ➕ Load More functionality for additional Pokémon
* ⏳ Loading states during API requests
* ⚠️ Error handling for failed requests and empty search results
* 🧠 Caching for Pokémon details and evolution chains
* 💤 Lazy loading for evolution data
* 🃏 Responsive Pokémon card layout
* 📖 Detailed Pokémon dialog
* 📊 Visual base stat bars
* 🌱 Evolution chains with support for multiple evolution paths
* ⬅️➡️ Previous and next navigation inside the detail dialog
* 📱 Responsive design for desktop, tablet and mobile

## 🛠️ Tech Stack

* **JavaScript**
* **HTML5**
* **CSS3**
* **PokéAPI**
* **REST API**
* **Git**
* **GitHub**

No framework or build step is required.

## 🌐 API Integration

The application consumes data from the public [PokéAPI](https://pokeapi.co/).

The app works with several API resources:

* Pokémon lists
* Pokémon details
* Pokémon species
* Evolution chains

Instead of loading every piece of information immediately, requests are split according to what the interface currently needs.

This reduces unnecessary API traffic and keeps the initial loading process smaller.

## 🧩 Main Concepts

### 🔄 Fetch and Render

The application first requests the required data and renders the interface after the response has been processed.

Asynchronous data handling is implemented with:

```javascript
fetch()
async
await
Promise.all()
```

### 💤 Lazy Loading

Evolution data is not requested during the initial Pokémon loading process.

It is fetched only when the user opens the Evolution tab inside the Pokémon detail dialog.

This keeps unnecessary requests out of the initial loading process.

### 🧠 Caching

Already loaded Pokémon details and evolution chains are stored in cache objects.

When the same information is requested again, the application can reuse the existing data instead of sending another API request.

### 🔎 Search

Search works with Pokémon that have already been loaded into the application.

Name searches start from three characters.

ID searches use exact IDs and also support formats such as:

```text
6
006
#006
```

### ⚠️ Error Handling

API requests are handled with `try` and `catch`.

The interface provides dedicated states for:

* Loading
* API errors
* Empty search results

## 📁 Project Structure

```text
Pokedex/
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

The JavaScript logic is separated into dedicated files for API communication, data handling, dialogs, evolution logic, search and reusable templates.

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/maxbelich/Pokedex.git
```

Open the project directory:

```bash
cd Pokedex
```

There are no dependencies to install.

Open `index.html` directly in your browser or serve the project with a local static server such as the VS Code **Live Server** extension.

## 🧠 What I Learned

This project gave me practical experience with consuming and processing data from an external REST API.

### 🌐 Working with APIs

I practiced requesting data with `fetch`, processing JSON responses and combining information from several related API endpoints.

### ⚡ Asynchronous JavaScript

I used `async`, `await` and `Promise.all` to coordinate multiple requests and ensure that dependent data is available before rendering.

### 🧠 Request Optimization

Lazy loading and caching helped reduce unnecessary API requests and made repeated interactions more efficient.

### 🧱 Code Structure

As the application grew, I separated responsibilities into multiple JavaScript files instead of keeping the entire application in one script.

### 🎨 UI States

I implemented dedicated loading, error and empty states so users receive feedback while data is being processed.

### 📱 Responsive Design

The card layout and detail dialog adapt to desktop, tablet and mobile screen sizes.

## 📝 Project Background

This project was created during my Fullstack Developer training.

Pokémon data is provided by [PokéAPI](https://pokeapi.co/).

This project is not affiliated with Nintendo, Game Freak, The Pokémon Company or PokéAPI.

## 👤 Author

**Max Belich**

[Portfolio](https://maxbelich.de/) · [LinkedIn](https://www.linkedin.com/in/max-belich-6b844b424/)

## 📄 License

This project is for educational and portfolio purposes.
