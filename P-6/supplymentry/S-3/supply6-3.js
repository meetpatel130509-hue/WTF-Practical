
const API_KEY = "YOUR_OMDB_API_KEY";
const BASE_URL = "https://www.omdbapi.com/";

const searchForm = document.getElementById("searchForm");
const movieInput = document.getElementById("movieInput");
const movieContainer = document.getElementById("movieContainer");
const genreSelect = document.getElementById("genre");
const savedMessage = document.getElementById("savedMessage");

let currentMovies = [];

// Load saved genre from Local Storage
const savedGenre = localStorage.getItem("preferredGenre");

if (savedGenre) {
    genreSelect.value = savedGenre;
    savedMessage.textContent = "Your preferred genre: " + savedGenre;
}

// Save preferred genre
genreSelect.addEventListener("change", function() {
    localStorage.setItem("preferredGenre", genreSelect.value);

    savedMessage.textContent =
        "Preferred genre saved: " + genreSelect.value;

    displayMovies(currentMovies);
});

// Search movies
searchForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const searchValue = movieInput.value.trim();

    if (searchValue === "") {
        alert("Please enter a movie name.");
        return;
    }

    await searchMovies(searchValue);
});

// Fetch movies from OMDb API
async function searchMovies(searchValue) {
    movieContainer.innerHTML = "<p class='info'>Loading movies...</p>";

    document.getElementById("detailsSection").hidden = true;

    try {
        const response = await fetch(
            `${BASE_URL}?s=${encodeURIComponent(searchValue)}&apikey=${API_KEY}`
        );

        const data = await response.json();

        if (data.Response === "True") {
            currentMovies = data.Search;
            displayMovies(currentMovies);
        } else {
            currentMovies = [];
            movieContainer.innerHTML =
                "<p class='info'>No movies found. Try another title.</p>";
        }

    } catch (error) {
        movieContainer.innerHTML =
            "<p class='info'>Unable to fetch movies. Check your internet connection.</p>";

        console.error(error);
    }
}

// Display movie cards
function displayMovies(movies) {
    movieContainer.innerHTML = "";

    if (!movies || movies.length === 0) {
        movieContainer.innerHTML =
            "<p class='info'>No movies available.</p>";
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        const poster = document.createElement("img");
        poster.src = movie.Poster !== "N/A"
            ? movie.Poster
            : "https://placehold.co/300x400?text=No+Poster";
        poster.alt = movie.Title + " poster";

        const info = document.createElement("div");
        info.className = "movie-info";

        const title = document.createElement("h3");
        title.textContent = movie.Title;

        const year = document.createElement("p");
        year.textContent = "Year: " + movie.Year;

        const type = document.createElement("p");
        type.textContent = "Type: " + movie.Type;

        const detailsButton = document.createElement("button");
        detailsButton.textContent = "View Details";
        detailsButton.addEventListener("click", () => {
            getMovieDetails(movie.imdbID);
        });

        info.append(title, year, type, detailsButton);
        card.append(poster, info);
        movieContainer.appendChild(card);
    });
}

// Fetch complete movie details
async function getMovieDetails(movieId) {
    const detailsSection = document.getElementById("detailsSection");
    const movieDetails = document.getElementById("movieDetails");

    detailsSection.hidden = false;
    movieDetails.textContent = "Loading movie details...";

    try {
        const response = await fetch(
            `${BASE_URL}?i=${encodeURIComponent(movieId)}&plot=full&apikey=${API_KEY}`
        );

        const movie = await response.json();

        if (movie.Response === "True") {
            movieDetails.innerHTML = "";

            const content = document.createElement("div");
            content.className = "details-content";

            const poster = document.createElement("img");
            poster.src = movie.Poster !== "N/A"
                ? movie.Poster
                : "https://placehold.co/300x400?text=No+Poster";
            poster.alt = movie.Title + " poster";

            const text = document.createElement("div");
            text.className = "details-text";

            const fields = [
                ["Title", movie.Title],
                ["Year", movie.Year],
                ["Genre", movie.Genre],
                ["Director", movie.Director],
                ["Actors", movie.Actors],
                ["Rating", movie.imdbRating],
                ["Plot", movie.Plot]
            ];

            fields.forEach(([label, value]) => {
                const paragraph = document.createElement("p");
                paragraph.textContent = label + ": " + value;
                text.appendChild(paragraph);
            });

            content.append(poster, text);
            movieDetails.appendChild(content);

            detailsSection.scrollIntoView({ behavior: "smooth" });
        } else {
            movieDetails.textContent = "Movie details not found.";
        }

    } catch (error) {
        movieDetails.textContent =
            "Unable to load movie details. Please try again.";
        console.error(error);
    }
}
