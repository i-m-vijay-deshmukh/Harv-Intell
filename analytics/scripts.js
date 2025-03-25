document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("getAdviceButton");
    if (button) {
        button.addEventListener("click", function () {
            console.log("Button clicked! Fetching crop data...");
            const cropName = document.getElementById("crop-input").value.trim();
            if (cropName) {
                fetchCropData(cropName);
            } else {
                alert("Please enter a crop name.");
            }
        });
    } else {
        console.error("Error: Button with ID 'getAdviceButton' not found.");
    }
});

async function fetchCropData(cropName) {
    const apiKey = "AIzaSyC8dMuQGnwkDwpVFRE_QeKa76iOpqKsujk"; // 🔹 Replace with your actual API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: `Provide detailed farming information for ${cropName}. Include:
                        - Crop yield prediction
                        - Water requirements
                        - Fertilizer usage at different growth stages
                        - Best planting time
                        - Ideal harvesting time
                        Present it in a well-formatted article style.`
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        console.log("Gemini Flash Response:", data);

        // Extracting the generated response from Gemini
        if (data.candidates && data.candidates.length > 0) {
            let articleContent = data.candidates[0].content.parts[0].text || "No response received.";

            // Format text response with HTML tags and remove asterisks (*)
            // Format text response with HTML tags
let formattedResponse = articleContent
.replace(/#/g, "")                              // Remove #
.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold **text**
.replace(/\*(.*?)\*/g, "🔹 $1")                // Replace * with 🔹 for bullet points
.replace(/\n/g, "<br>");                        // Line breaks


            document.getElementById("results").innerHTML = `
                <h2>📖 ${cropName.toUpperCase()} - Complete Farming Guide</h2>
                <div class="article-box">${formattedResponse}</div>
            `;
        } else {
            document.getElementById("results").innerHTML = `<p>❌ No valid response received from Gemini Flash 2.0.</p>`;
        }

    } catch (error) {
        console.error("Error fetching Gemini Flash data:", error);
        document.getElementById("results").innerHTML = `<p>❌ Error fetching data. Check console for details.</p>`;
    }
}

// Attach the function to the "Get Advice" button
document.getElementById("getAdviceButton").addEventListener("click", function () {
    const cropName = document.getElementById("crop-input").value.trim();
    if (cropName) {
        fetchCropData(cropName);
    } else {
        alert("Please enter a crop name.");
    }
});