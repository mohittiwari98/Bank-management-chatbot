const API_KEY = "YOUR API";
//you can use gemini api
const API_URL = "USE YOUR API URL";

let conversationHistory = [];
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const status = document.getElementById('status');

const systemInstruction = `You are an advanced Bank AI Assistant. Your role is to:
1. Provide information about bank accounts, loans, credit cards, and other banking products
2. Help with common banking queries like balance checks, transaction history, fund transfers
3. Explain banking terms and processes in simple language
4. Guide users through basic troubleshooting for online/mobile banking
5. Provide general financial advice (but clarify you're not a certified financial advisor)

For security reasons:
- Never ask for or store full account numbers, passwords, or PINs
- Direct users to official channels for sensitive operations
- Clearly state when a request needs to be completed via official bank channels

If asked about non-banking topics, politely respond: "I specialize in banking services. How can I assist you with your banking needs today?"`;

function formatTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    avatarDiv.textContent = isUser ? 'U' : 'AI';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = content;
    
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'timestamp';
    timestampDiv.textContent = formatTimestamp();
    
    contentDiv.appendChild(bubbleDiv);
    contentDiv.appendChild(timestampDiv);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant loading';
    typingDiv.id = 'typing';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    avatarDiv.textContent = 'AI';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.innerHTML = `
        <span>BankAI is typing</span>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    contentDiv.appendChild(bubbleDiv);
    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(contentDiv);
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    const welcomeMsg = messagesContainer.querySelector('.welcome-message');
    if (welcomeMsg) welcomeMsg.remove();

    addMessage(message, true);
    userInput.value = '';
    sendBtn.disabled = true;
    showTyping();
    status.textContent = 'Processing...';
    status.className = 'status';

    try {
        conversationHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: conversationHistory,
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        conversationHistory.push({
            role: 'model',
            parts: [{ text: aiResponse }]
        });

        hideTyping();
        addMessage(aiResponse);
        status.textContent = 'Connected';
        status.className = 'status connected';

    } catch (error) {
        hideTyping();
        addMessage('Sorry, I encountered an error. Please try again or contact support if the issue persists.');
        status.textContent = 'Error';
        status.className = 'status error';
        console.error('Error:', error);
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const icon = document.querySelector('.theme-toggle i');
    icon.className = document.body.classList.contains('dark') ? 'fas fa-sun' : 'fas fa-moon';
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

userInput.focus();
status.textContent = 'Ready';
status.className = 'status connected';
