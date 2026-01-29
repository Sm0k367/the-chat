import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

const ImageBox = ({ prompt }) => {
  // FIXED: Updated URL to the most stable Pollinations endpoint
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux`;
  
  return (
    <div className="image-card">
      <img src={imageUrl} alt="AI Neural Render" />
      <div className="image-status">Art Engine: Flux.1 // Status: Rendered</div>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'SYSTEM_READY: Epic Tech AI is online. I can generate 8K art and solve complex tech queries.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chat = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: `You are EPIC TECH AI. Expert, high-end, witty. 
            IMAGE TRIGGER: If the user wants an image, start your response with "IMAGE_PROMPT: " followed by a hyper-detailed cinematic prompt. 
            Example: "IMAGE_PROMPT: A futuristic city in 8k, volumetric lighting."` 
          },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });
      setMessages(prev => [...prev, { role: 'assistant', content: chat.choices[0].message.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'CRITICAL_ERROR: Check VITE_GROQ_API_KEY.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header><h1>EPIC TECH AI</h1></header>
      <div className="chat-window">
        {messages.map((m, i) => {
          const isImage = m.content.includes('IMAGE_PROMPT:');
          const text = m.content.replace('IMAGE_PROMPT:', '').trim();
          return (
            <div key={i} className={`message ${m.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
              <div>{text}</div>
              {isImage && <ImageBox prompt={text} />}
            </div>
          );
        })}
        {loading && <div className="message ai-msg" style={{opacity: 0.5}}>CALCULATING_RESPONSE...</div>}
        <div ref={endRef} />
      </div>
      <form className="input-area" onSubmit={handleSend}>
        <div className="input-container">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Awaiting command..." />
          <button type="submit">{loading ? '...' : 'EXECUTE'}</button>
        </div>
      </form>
    </>
  );
}
