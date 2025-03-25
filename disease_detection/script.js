document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("imageUpload");
    const previewImage = document.getElementById("previewImage");
    const uploadContainer = document.getElementById("upload-container");
    const analyzeButton = document.getElementById("analyzeButton");
    const responseContainer = document.getElementById("disease-info");

    // Image Preview
    if (fileInput) {
        fileInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function () {
                    previewImage.src = reader.result;
                    previewImage.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Function to display text word by word from center
    function typeWriterEffect(element, text, speed = 50) {
        element.innerHTML = ""; // Clear previous content
        let words = text.split(" "); // Split into words
        let i = 0;

        function addNextWord() {
            if (i < words.length) {
                element.innerHTML = `<span style="text-align:center; display:block;">${words.slice(0, i + 1).join(" ")}</span>`;
                i++;
                setTimeout(addNextWord, speed);
            }
        }

        addNextWord();
    }

    // Define analyzeImage function
    window.analyzeImage = async function () {
        if (!previewImage.src || previewImage.src === window.location.href) {
            alert("⚠️ Please upload an image first!");
            return;
        }

        // Hide Upload Section & Button for Clean UI
        if (uploadContainer) uploadContainer.style.display = "none";
        if (analyzeButton) analyzeButton.style.display = "none";
        previewImage.classList.add("centered-image");

        try {
            const apiKey = "AIzaSyB7JedGtsUDzQZ-w5cSdCeQQParNf7fgPc"; // Replace with actual API key
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onloadend = async function () {
                const base64Image = reader.result.split(',')[1];

                const requestData = {
                    contents: [
                        {
                            parts: [
                                { text: "🔍 Analyze this image for plant diseases and provide a structured diagnosis with symptoms, causes, solutions, and pesticide recommendations." },
                                {
                                    inline_data: {
                                        mime_type: file.type,
                                        data: base64Image
                                    }
                                }
                            ]
                        }
                    ]
                };

                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "❌ No response received.";

                // Preserve Formatting
                let formattedResponse = aiResponse
                    .replace(/#/g, "") // Remove Markdown headings
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
                    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic text
                    .replace(/\n{2,}/g, "</p><p>") // Convert double newlines to paragraph breaks
                    .replace(/\n/g, "<br>") // Convert single newlines to line breaks
                    .replace(/- (.*?)<br>/g, "🔹 <strong>$1</strong><br>"); // Bullet points

                // Display Response
                responseContainer.innerHTML = `
                    <h3 style="color: #00eaff; text-shadow: 0 0 10px #00eaff;">📖 <strong>AI Diagnosis & Solution</strong></h3>
                    <div class="response-box" style="opacity: 0; transition: opacity 0.5s; text-align: center;">
                        <p id="response-text"></p>
                    </div>
                `;

                // Fade in effect
                setTimeout(() => {
                    document.querySelector(".response-box").style.opacity = "1";
                }, 100);

                // Start the typing effect (expanding from center)
                const responseTextElement = document.getElementById("response-text");
                typeWriterEffect(responseTextElement, formattedResponse);
            };
        } catch (error) {
            console.error("❌ Error analyzing image:", error);
            responseContainer.innerHTML = `
                <h3 style="color: red;">❌ Error: Could not retrieve disease information.</h3>
                <p>Please try again later.</p>
            `;
        }
    };

    if (analyzeButton) analyzeButton.addEventListener("click", analyzeImage);
});
