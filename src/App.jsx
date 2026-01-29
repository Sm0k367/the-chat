import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

// NEW: Real Media Renderer Component
const MediaRenderer = ({ type, prompt }) => {
  if (type === 'image') {
    // REAL Image Generation via Pollinations (No Key Required)
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
    return (
      <div className="media-container">
        <img src={imageUrl} alt={prompt} loading="lazy" />
        <div className="media-info">
          <span>GEN_TYPE: IMAGE</span>
          <a href={imageUrl} target="_blank" className="badge badge-image">DOWNLOAD</a>
        </div>
      </div>
    );
  }
  
  if (type === 'video') {
    return (
      <div className="media-container">
        <div style={{padding: '20px', textAlign: 'center'}}>
          <p>🎥 VIDEO_LINK_STABILIZING...</p>
          <small>Prompt: {prompt}</small>
        </div>
        <div className="media-info">
          <span className="badge badge-video">VIDEO_GEN_ACTIVE</span>
        </div>
      </div>
    );
  }
  return null;
};

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'SYSTEM_LINK: ONLINE. Epic Tech AI media engine ready. Type "generate image of..." or "create video of..."' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            content: `You are Epic Tech AI. 
            If the user wants an image, start your response with "IMAGE_GEN: " followed by a descriptive prompt. 
            If they want a video, start with "VIDEO_GEN: " followed by a prompt.
            Otherwise, just chat. Tone: Expert, chill, fueled by caffeine.` 
          },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const content = chatCompletion.choices[0]?.message?.content;
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'ERROR: LINK_DROPPED.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chat-window">
        {messages.map((msg, idx) => {
          const isImage = msg.content?.startsWith('IMAGE_GEN:');
          const isVideo = msg.content?.startsWith('VIDEO_GEN:');
          const cleanText = msg.content?.replace(/IMAGE_GEN:|VIDEO_GEN:/g, '');

          return (
            <div key={idx} className={`message ${msg.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
              {cleanText}
              {isImage && <MediaRenderer type="image" prompt={cleanText} />}
              {isVideo && <MediaRenderer type="video" prompt={cleanText} />}
            </div>
          );
        })}
        {loading && <div className="message ai-msg pulse">NEURAL_PROCESSING...</div>}
        <div ref={chatEndRef} />
      </div>

      <form className="input-area" onSubmit={handleSendMessage}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Generate image of a cyberpunk city..." />
        <button type="submit" disabled={loading}>EXECUTE</button>
      </form>
    </>
  );
};

export default App;
