import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

// Initialize Groq - In production, use import.meta.env.VITE_GROQ_API_KEY
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'PASTE_YOUR_KEY_HERE_FOR_TESTING',
  dangerouslyAllowBrowser: true 
});

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'SYSTEM_LINK: ONLINE. Epic Tech AI is active. What are we creating today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: 'You are Epic Tech AI, a creative multimedia artist created by @Sm0ken42O. You are fueled by cannabis and caffeine. You specialize in music (Suno AI), digital art, and video creation. Your tone is witty, expert, and chill. Use emojis sparingly but effectively ☕🌿🔥.' 
          },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content || "CONNECTION_ERROR: Lost link to the neural net.";
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'ERROR: API_KEY_INVALID or Rate Limit reached.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="message ai-msg pulse">AI is processing...</div>}
        <div ref={chatEndRef} />
      </div>

      <form className="input-area" onSubmit={handleSendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'SEND'}
        </button>
      </form>
    </>
  );
};

export default App;
