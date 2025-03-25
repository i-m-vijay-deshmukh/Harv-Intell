document.addEventListener("DOMContentLoaded", () => {
    // Show main content immediately
    document.getElementById("main-content").style.display = "block";

    // Navigation Logic
    document.getElementById("weather-section").addEventListener("click", () => {
        window.location.href = "weather.html";
    });
    
    document.getElementById("chatbot-section").addEventListener("click", () => {
        window.location.href = "chatbot/chatbot.html";
    });
    
    document.getElementById("disease-section").addEventListener("click", () => {
        window.location.href = "disease_detection/disease-detection.html";
    });
    
    document.getElementById("news-section").addEventListener("click", () => {
        window.location.href = "news/news.html";
    });
    document.getElementById("analysis-section").addEventListener("click", () => {
        window.location.href = "analytics/analysis.html";
    });
});