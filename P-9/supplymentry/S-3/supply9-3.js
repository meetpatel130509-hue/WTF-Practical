
const API_KEY = "YOUR_OMDB_API_KEY";
const API_URL = "https://www.omdbapi.com/";

const searchForm = document.getElementById("searchForm");
const movieInput = document.getElementById("movieInput");
const movieContainer = document.getElementById("movieContainer");
const message = document.getElementById("message");

// Search movies when form is submitted
searchForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const movieName = movieInput.value.trim();

    if (movieName === "") {
        message.textContent = "Please enter a movie name.";
        return;
    }

    searchMovies(movieName);
});

// Fetch movie search results from API
async function searchMovies(movieName) {
    message.textContent = "Loading movies...";
    movieContainer.innerHTML = "";

    document.getElementById("detailsSection").hidden = true;

    try {
        const response = await fetch(
            `${API_URL}?s=${encodeURIComponent(movieName)}&apikey=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error("Unable to connect to movie API.");
        }

        const data = await response.json();

        if (data.Response === "True") {
            message.textContent =
                "Movies found: " + data.totalResults;

            displayMovies(data.Search);

        } else {
            message.textContent =
                data.Error || "No movies found.";

            movieContainer.innerHTML =
                "<p class='info'>Try searching with another movie name.</p>";
        }

    } catch (error) {
        message.textContent =
            "Error loading movies. Check your internet connection.";

        console.error(error);
    }
}

// Display movie posters and basic information
function displayMovies(movies) {
    movieContainer.innerHTML = "";

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
        year.textContent = "Release Year: " + movie.Year;

        const type = document.createElement("p");
        type.textContent = "Type: " + movie.Type;

        const button = document.createElement("button");
        button.textContent = "View Details";

        button.addEventListener("click", function() {
            getMovieDetails(movie.imdbID);
        });

        info.append(title, year, type, button);
        card.append(poster, info);

        movieContainer.appendChild(card);
    });
}

// Fetch complete information for selected movie
async function getMovieDetails(movieId) {
    const detailsSection =
        document.getElementById("detailsSection");

    const movieDetails =
        document.getElementById("movieDetails");

    detailsSection.hidden = false;
    movieDetails.textContent = "Loading movie details...";

    try {
        const response = await fetch(
            `${API_URL}?i=${encodeURIComponent(movieId)}&plot=full&apikey=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch movie details.");
        }

        const movie = await response.json();

        if (movie.Response === "True") {
            displayMovieDetails(movie);
        } else {
            movieDetails.textContent =
                "Movie details are not available.";
        }

    } catch (error) {
        movieDetails.textContent =
            "Unable to load movie details.";

        console.error(error);
    }
}

// Display selected movie details
function displayMovieDetails(movie) {
    const movieDetails =
        document.getElementById("movieDetails");

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

    const heading = document.createElement("h3");
    heading.textContent = movie.Title;

    text.appendChild(heading);

    const fields = [
        ["Release Year", movie.Year],
        ["Genre", movie.Genre],
        ["IMDb Rating", movie.imdbRating],
        ["Director", movie.Director],
        ["Actors", movie.Actors],
        ["Language", movie.Language],
        ["Runtime", movie.Runtime],
        ["Description", movie.Plot]
    ];

    fields.forEach(([label, value]) => {
        if (value && value !== "N/A") {
            const paragraph = document.createElement("p");
            paragraph.textContent = label + ": " + value;
            text.appendChild(paragraph);
        }
    });

    content.append(poster, text);
    movieDetails.appendChild(content);

    document.getElementById("detailsSection").scrollIntoView({
        behavior: "smooth"
    });
}
