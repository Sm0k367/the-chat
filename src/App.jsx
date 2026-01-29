import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

const MediaRenderer = ({ prompt }) => {
  const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
  return (
    <div className="media-container" style={{marginTop: '15px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,242,255,0.3)'}}>
      <img src={imageUrl} alt="AI Art" style={{width: '100%', display: 'block'}} />
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'SYSTEM_LINK: ONLINE. Ready to create.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chat = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are Epic Tech AI. Expert, chill, multimedia master. If asked for art, start with IMAGE_GEN: followed by a cinematic 8k prompt.' },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });
      setMessages(prev => [...prev, { role: 'assistant', content: chat.choices[0].message.content }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'LINK_ERROR: Check API Key.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="header"><h1>EPIC TECH AI</h1></div>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
            {m.content.replace('IMAGE_GEN:', '')}
            {m.content.startsWith('IMAGE_GEN:') && <MediaRenderer prompt={m.content} />}
          </div>
        ))}
        {loading && <div className="message ai-msg" style={{opacity: 0.5}}>PROCESSING...</div>}
        <div ref={endRef} />
      </div>
      <form className="input-area" onSubmit={send}>
        <div className="input-container">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a command..." />
          <button type="submit">{loading ? '...' : 'SEND'}</button>
        </div>
      </form>
    </>
  );
}
