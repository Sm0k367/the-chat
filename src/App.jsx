import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

// Initialize Groq SDK
// Note: Ensure VITE_GROQ_API_KEY is set in your Vercel Environment Variables
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

// Component to render real-time generated images
const MediaRenderer = ({ prompt }) => {
  // Pollinations.ai generates real images based on the prompt provided by the AI
  const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
  
  return (
    <div className="media-container">
      <img src={imageUrl} alt={prompt} loading="lazy" />
      <div className="media-info">
        <span>GEN_TYPE: ART_ENGINE_V1</span>
        <a href={imageUrl} target="_blank" rel="noreferrer" className="badge-image">
          OPEN_HD
        </a>
      </div>
    </div>
  );
};

const App = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'SYSTEM_LINK: ONLINE. Epic Tech AI active. I can chat or generate high-fidelity art. Try: "Generate a cyberpunk oasis."' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Keep chat scrolled to the latest message
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
            content: `You are Epic Tech AI, a creative multimedia artist by @Sm0ken42O. 
            Tone: Witty, expert, fueled by ☕🌿.
            IMAGE RULE: If the user wants art/image, start your reply with "IMAGE_GEN: " followed by a massive, descriptive prompt (include '8k', 'cinematic lighting', 'masterpiece').
            Otherwise, engage in high-level tech/creative chat.` 
          },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const responseContent = chatCompletion.choices[0]?.message?.content || "STABILIZATION_LOST: Signal weak.";
      setMessages((prev) => [...prev, { role: 'assistant', content: responseContent }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'ERROR: Check VITE_GROQ_API_KEY in Vercel settings.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="chat-window">
        {messages.map((msg, idx) => {
          const isImageRequest = msg.content?.startsWith('IMAGE_GEN:');
          const displayContent = msg.content?.replace('IMAGE_GEN:', '').trim();

          return (
            <div key={idx} className={`message ${msg.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
              <div className="text-content">{displayContent}</div>
              {isImageRequest && <MediaRenderer prompt={displayContent} />}
            </div>
          );
        })}
        {loading && <div className="message ai-msg pulse">NEURAL_SYNC_IN_PROGRESS...</div>}
        <div ref={chatEndRef} />
      </div>

      <form className="input-area" onSubmit={handleSendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Command the AI..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'EXECUTE'}
        </button>
      </form>
    </div>
  );
};

export default App;
