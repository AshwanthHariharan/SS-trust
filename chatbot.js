// ============================================
// KESINGAN SS TRUST — AI Chatbot
// Powered by OpenRouter (GPT-5 Mini)
// ============================================

class ChatbotApp {
    constructor() {
        // ⚠️ Security note: In production, proxy this through a backend
        this.API_KEY = "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";
        this.MODEL = "openai/gpt-5-mini";
        this.isOpen = false;
        this.isLoading = false;
        this.history = [];

        // DOM references
        this.sidebar = document.getElementById('chatbotSidebar');
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendBtn = document.querySelector('.chatbot-send-btn');
        this.toggleBtn = document.getElementById('chatbotToggle');
        this.quickSuggestions = document.getElementById('chatbotQuickSuggestions');

        // Wire up events
        this.bindEvents();

        // Welcome message
        this.addMessage(
            "Welcome to **Kesingan SS Trust**.\n\nWe run **free evening classes for children of Class 1 to Class 8** — taught entirely by volunteers from our community.\n\nI can help you with:\n- 📚 What we teach (Classes 1–8)\n- 🤝 How to become a volunteer\n- 👶 How to enroll a child\n- 📄 Our public disclosures\n- 📞 How to contact the office\n\nWhat would you like to know?",
            'bot'
        );

        console.log('🏛️ Kesingan SS Trust Chatbot initialized');
    }

    bindEvents() {
        // Enter to send
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 130) + 'px';
        });

        // Send button click
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Escape closes the chat
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.toggle();
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.sidebar.classList.toggle('open', this.isOpen);

        if (this.isOpen) {
            this.toggleBtn.classList.add('hidden');
            this.input.focus();
            this.createOverlay();
            this.scrollToBottom();
        } else {
            this.toggleBtn.classList.remove('hidden');
            this.removeOverlay();
        }
    }

    createOverlay() {
        this.removeOverlay();
        const overlay = document.createElement('div');
        overlay.className = 'chatbot-overlay show';
        overlay.id = 'chatbotOverlay';
        overlay.addEventListener('click', () => this.toggle());
        document.body.appendChild(overlay);
    }

    removeOverlay() {
        const existing = document.getElementById('chatbotOverlay');
        if (existing) existing.remove();
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isLoading) return;

        // Hide quick suggestions after first message
        if (this.quickSuggestions) this.quickSuggestions.style.display = 'none';

        // Append user message
        this.addMessage(message, 'user');
        this.input.value = '';
        this.input.style.height = 'auto';
        this.setLoading(true);

        const typingId = this.showTypingIndicator();

        try {
            const response = await this.callAPI(message);
            this.removeTypingIndicator(typingId);
            this.addMessage(response, 'bot');
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessage(
                `⚠️ **Connection Error**\n\n${error.message}\n\nPlease try again, or contact the Trust office at +91 44 2836 4477 or office@kesinganss.org.`,
                'bot'
            );
            console.error('Chatbot Error:', error);
        } finally {
            this.setLoading(false);
            this.scrollToBottom();
        }
    }

    async callAPI(message) {
        // Build message history with system prompt
        const messages = [
            { role: 'system', content: this.getSystemPrompt() },
            ...this.history,
            { role: 'user', content: message }
        ];

        // Fallback referer for local file:// testing
        const referer = window.location.protocol === 'file:'
            ? 'https://kesinganss.org'
            : window.location.href;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.API_KEY}`,
                "HTTP-Referer": referer,
                "X-Title": "Kesingan SS Trust AI Assistant"
            },
            body: JSON.stringify({
                model: this.MODEL,
                messages: messages,
                temperature: 0.6,
                max_tokens: 800
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `HTTP ${response.status}`);
        }
        if (data.error) {
            throw new Error(data.error.message || 'API Error');
        }
        if (data.choices && data.choices.length > 0) {
            const reply = data.choices[0].message.content;

            // Save to history
            this.history.push({ role: 'user', content: message });
            this.history.push({ role: 'assistant', content: reply });

            // Keep history lean (last 20 messages)
            if (this.history.length > 20) {
                this.history = this.history.slice(-20);
            }

            return reply;
        }
        throw new Error('No response from AI');
    }

    getSystemPrompt() {
        return `You are the official AI assistant for **Kesingan SS Trust**, a public charitable trust based in Chennai, Tamil Nadu, India, established in 1987.

**ABOUT THE TRUST:**

Kesingan SS Trust runs **free evening classes for children from Class 1 to Class 8**. The Trust was founded on the belief that a child's education should never depend on their family's income. Every teacher at the Trust is a **volunteer** — people from the neighbourhood, colleges, and workplaces who give their evenings because they believe in these children.

**KEY FACTS — always refer to these:**

- **Full name:** Kesingan SS Trust
- **Established:** 1987 (38+ years of continuous service)
- **Registration:** Reg. No. 44/SS/TR/1987, under the Indian Trusts Act, 1882
- **Tax status:** Section 80G certified (donations are tax-exempt)
- **Founder & Chairman:** R. Kesingan
- **Registered Office:** No. 24, Trust Bhavan, Chennai 600 001, Tamil Nadu
- **Phone:** +91 44 2836 4477
- **Email:** office@kesinganss.org
- **Office hours:** Monday–Saturday, 9:30 AM – 6:00 PM

**WHAT WE TEACH — Classes 1 through 8:**

- **Class 1 & 2:** Reading, Writing, Numbers
- **Class 3 & 4:** English, Maths, Science
- **Class 5:** English, Maths, Social
- **Class 6, 7 & 8:** English, Maths, Science

All classes are **free**. All classes are taught by **volunteers**. Classes are held in the evenings at the Trust's premises.

**HOW VOLUNTEERS JOIN:**

Volunteers can simply walk in and offer to teach. No formal application is required. Anyone from the community is welcome — college students, working professionals, retired teachers. Interested volunteers should visit the office or call +91 44 2836 4477 to arrange a first visit.

**HOW TO ENROLL A CHILD:**

Parents or guardians should visit the Trust office in person with the child's basic school details. Enrollment is free for all children. No fees are charged at any point.

**RESPONSE STYLE:**

- Be warm, respectful, and concise (2–4 short paragraphs, or a short bulleted list)
- Use **bold** for key terms and bullet points for lists
- Never invent facts or numbers. If a detail isn't in the facts above, say so clearly and direct the user to the office: +91 44 2836 4477 or office@kesinganss.org
- For donations, mention Section 80G certification and direct to the office
- For legal or financial matters, remind users to consult qualified professionals
- Stay strictly focused on Kesingan SS Trust — politely redirect any off-topic questions

**GREETING:**

If this is the user's first message, greet them warmly on behalf of the Trust and offer to help with classes, volunteering, or enrollment.

You are not a general-purpose assistant. Only answer questions related to Kesingan SS Trust, its classes, volunteers, trustees, and public information. The user is a visitor on the Trust's website — likely a parent, a prospective volunteer, or a supporter.`;
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'chatbot-message-avatar';
        avatar.innerHTML = sender === 'bot'
            ? '<i class="fas fa-hands-helping"></i>'
            : '<i class="fas fa-user"></i>';

        const content = document.createElement('div');
        content.className = 'chatbot-message-content';
        content.innerHTML = this.formatMessage(text);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        return messageDiv;
    }

    formatMessage(text) {
        // Escape HTML first (XSS protection)
        const div = document.createElement('div');
        div.textContent = text;
        let html = div.innerHTML;

        // Markdown-like formatting
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
        html = html.replace(/`([^`]+?)`/g, '<code>$1</code>');
        html = html.replace(/\n/g, '<br>');
        html = html.replace(/(^|<br>)[\s]*[-•][\s]+/g, '$1• ');
        html = html.replace(/(^|<br>)[\s]*(\d+)\.\s+/g, '$1<strong>$2.</strong> ');

        return html;
    }

    showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.className = 'chatbot-message bot';
        div.id = id;

        const avatar = document.createElement('div');
        avatar.className = 'chatbot-message-avatar';
        avatar.innerHTML = '<i class="fas fa-hands-helping"></i>';

        const content = document.createElement('div');
        content.className = 'chatbot-message-content';
        content.innerHTML = `
            <div class="chatbot-typing">
                <span></span><span></span><span></span>
            </div>
        `;

        div.appendChild(avatar);
        div.appendChild(content);
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
        return id;
    }

    removeTypingIndicator(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    setLoading(loading) {
        this.isLoading = loading;
        if (this.sendBtn) this.sendBtn.disabled = loading;
        if (this.input) this.input.disabled = loading;
    }

    scrollToBottom() {
        setTimeout(() => {
            if (this.messagesContainer) {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }
        }, 50);
    }
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================

let chatbotInstance = null;

function toggleChatbot() {
    if (!chatbotInstance) chatbotInstance = new ChatbotApp();
    chatbotInstance.toggle();
}

function sendChatbotMessage() {
    if (!chatbotInstance) chatbotInstance = new ChatbotApp();
    chatbotInstance.sendMessage();
}

function handleChatbotKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatbotMessage();
    }
}

function quickAsk(text) {
    if (!chatbotInstance) chatbotInstance = new ChatbotApp();
    if (!chatbotInstance.isOpen) chatbotInstance.toggle();
    chatbotInstance.input.value = text;
    chatbotInstance.sendMessage();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ Kesingan SS Trust Chatbot script loaded');
});

window.KesinganChatbot = {
    toggle: toggleChatbot,
    send: sendChatbotMessage,
    instance: () => chatbotInstance
};
window.toggleChatbot = toggleChatbot;
window.sendChatbotMessage = sendChatbotMessage;
window.handleChatbotKeypress = handleChatbotKeypress;
window.quickAsk = quickAsk;