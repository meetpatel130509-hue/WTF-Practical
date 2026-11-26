
const API_URL =
    "https://jsonplaceholder.typicode.com/posts?_limit=12";

const newsContainer = document.getElementById("newsContainer");
const statusText = document.getElementById("status");
const lastUpdated = document.getElementById("lastUpdated");
const refreshBtn = document.getElementById("refreshBtn");

// Fetch news articles from the JSON source
async function fetchNews() {
    statusText.textContent = "Loading news...";
    refreshBtn.disabled = true;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch news");
        }

        const articles = await response.json();

        displayNews(articles);

        statusText.textContent =
            `Showing ${articles.length} headlines.`;

        lastUpdated.textContent =
            "Last updated: " + new Date().toLocaleTimeString();

    } catch (error) {
        statusText.textContent =
            "Unable to load news. Please check your internet connection.";

        console.error("Error fetching news:", error);

    } finally {
        refreshBtn.disabled = false;
    }
}

// Display the articles on the webpage
function displayNews(articles) {
    newsContainer.replaceChildren();

    articles.forEach((article) => {
        const card = document.createElement("article");
        card.className = "news-card";

        const title = document.createElement("h3");
        title.textContent = article.title;

        const description = document.createElement("p");
        description.textContent = article.body;

        const link = document.createElement("a");
        link.href =
            `https://jsonplaceholder.typicode.com/posts/${article.id}`;
        link.textContent = "Read Article →";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        card.append(title, description, link);
        newsContainer.appendChild(card);
    });
}

// Manual refresh button
refreshBtn.addEventListener("click", fetchNews);

// Load news when the page opens
fetchNews();

// Automatically refresh every 30 seconds
setInterval(fetchNews, 30000);
