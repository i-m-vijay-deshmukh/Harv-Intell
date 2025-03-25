const API_KEY = 'f137c5df03cec70d19f40ad9a2423afc'; // Replace with your actual API key
let userCountry = 'us'; // Default country
const query = "agriculture"; // Fixed search term for agriculture news
let isFetching = false; // Prevent multiple fetches
const seenArticles = new Set(); // Track articles to prevent duplicates
let lastArticleTimestamp = new Date().toISOString(); // Track last fetched article timestamp

async function getUserCountry() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async () => {
            try {
                const geoResponse = await fetch(`https://ipapi.co/json/`);
                const geoData = await geoResponse.json();
                userCountry = geoData.country_code.toLowerCase();
            } catch (error) {
                console.error("Error fetching location via IP:", error);
            }
            fetchNews(); // Fetch news after detecting location
        }, async () => {
            console.warn("Geolocation permission denied, using IP lookup...");
            try {
                const geoResponse = await fetch(`https://ipapi.co/json/`);
                const geoData = await geoResponse.json();
                userCountry = geoData.country_code.toLowerCase();
            } catch (error) {
                console.error("Error fetching location via IP:", error);
            }
            fetchNews(); // Fetch news after fallback
        });
    } else {
        console.warn("Geolocation not supported, using IP lookup...");
        try {
            const geoResponse = await fetch(`https://ipapi.co/json/`);
            const geoData = await geoResponse.json();
            userCountry = geoData.country_code.toLowerCase();
        } catch (error) {
            console.error("Error fetching location via IP:", error);
        }
        fetchNews(); // Fetch news after fallback
    }
}

async function fetchNews() {
    if (isFetching) return; // Prevent multiple fetches
    isFetching = true;

    const API_URL = `https://gnews.io/api/v4/search?q=${query}&country=${userCountry}&from=${lastArticleTimestamp}&apikey=${API_KEY}`;

    document.getElementById("loading").style.display = "block";
    const newsContainer = document.getElementById('news-container');

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        document.getElementById("loading").style.display = "none";

        if (!data.articles || data.articles.length === 0) {
            newsContainer.innerHTML += "<p class='no-news'>🚜 No more agriculture news available.</p>";
            return;
        }

        let newArticles = data.articles.filter(article => !seenArticles.has(article.url)); // Filter duplicates

        if (newArticles.length === 0) {
            console.log("No new unique articles found, retrying with older timestamp...");
            lastArticleTimestamp = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(); // Fetch older news
            fetchNews();
            return;
        }

        newArticles.forEach(article => {
            seenArticles.add(article.url); // Mark article as seen

            const newsCard = document.createElement('div');
            newsCard.classList.add('news-card');

            newsCard.innerHTML = `
                <img src="${article.image || 'https://via.placeholder.com/300'}" alt="News Image">
                <h2>🌾 <b>${article.title}</b></h2>
                <p>${article.description}</p>
                <a href="${article.url}" target="_blank">🔗 Read More</a>
            `;

            newsContainer.appendChild(newsCard);
        });

        // Update timestamp to fetch only older news in the next call
        lastArticleTimestamp = new Date(newArticles[newArticles.length - 1].publishedAt).toISOString();

        isFetching = false; // Allow fetching more
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContainer.innerHTML += "<p class='error'>⚠️ Error fetching more agriculture news. Please try again.</p>";
        isFetching = false;
    }
}

// Infinite Scroll Feature
function observeLastNewsItem() {
    const observer = new IntersectionObserver(entries => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting) {
            fetchNews(); // Load more news when the last news item is visible
        }
    }, { threshold: 1 });

    setInterval(() => {
        const newsItems = document.querySelectorAll('.news-card');
        if (newsItems.length > 0) {
            observer.observe(newsItems[newsItems.length - 1]); // Observe the last news card
        }
    }, 1000);
}

// Start fetching news and enable infinite scrolling
getUserCountry();
observeLastNewsItem();
