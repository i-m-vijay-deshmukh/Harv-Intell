const chatBox = document.querySelector(".chat-box");
const inputField = chatBox?.querySelector("input[type='text']");
const button = chatBox?.querySelector("button");
const chatBoxBody = chatBox?.querySelector(".chat-box-body");

if (button && inputField && chatBoxBody) {
  button.addEventListener("click", sendMessage);
  inputField.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  function sendMessage() {
    const message = inputField.value.trim();
    if (!message) return;

    inputField.value = "";

    // Add user message to chat
    chatBoxBody.innerHTML += `<div class="message"><p>${message}</p></div>`;

// Show loading state
const loadingDiv = document.createElement("div");
loadingDiv.classList.add("response", "loading");
// Show typing dots animation
loadingDiv.innerHTML = "<span>.</span><span>.</span><span>.</span>"; 
chatBoxBody.appendChild(loadingDiv);

    chatBoxBody.appendChild(loadingDiv);

    scrollToBottom();

    fetch("https://agrotech-7.onrender.com/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      })
        .then(response => response.json())
        .then(data => {
          loadingDiv.remove();
      
          let botReply = data.message || "Sorry, I couldn't generate a response.";
          
          // 🔥 Remove all unwanted markdown symbols (*, **, ***)
          botReply = botReply.replace(/\*\*\*/g, "").replace(/\*\*/g, "").replace(/\*/g, "");
      
          // 🔥 Apply typing effect
          typeResponse(botReply);
        })
        .catch(error => {
          console.error("❌ Error:", error);
          loadingDiv.remove();
          chatBoxBody.innerHTML += `<div class="response error"><p>Error: ${error.message}</p></div>`;
        });
      
  }

  function typeResponse(text, speed = 30) {
    const responseDiv = document.createElement("div");
    responseDiv.classList.add("response");
    chatBoxBody.appendChild(responseDiv);

    let index = 0;
    function type() {
      if (index < text.length) {
        responseDiv.innerHTML += text[index];
        index++;
        setTimeout(type, speed);
      }
    }
    type();
    scrollToBottom();
  }

  function scrollToBottom() {
    chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
  }
}

// Function to Show Warning Popup
function showPopup() {
    const popupContainer = document.createElement("div");
    popupContainer.classList.add("popup-container");

    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `
        <p>⚠️ Warning: This AI is not updated and may provide outdated responses.</p>
        <button onclick="dismissPopup()">Got it</button>
    `;

    popupContainer.appendChild(popup);
    document.body.appendChild(popupContainer);
}

// Function to Dismiss Popup
function dismissPopup() {
    document.querySelector(".popup-container").remove();
}

// Show popup when the chatbot loads
window.onload = showPopup;
