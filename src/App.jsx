import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

const MediaRenderer = ({ prompt }) => {
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
  
  return (
    <div className="media-container">
      <img src={imageUrl} alt="AI Generated Art" loading="lazy" />
      <div style={{padding: '10px', fontSize: '0.7rem', color: '#00f2ff', background: 'rgba(0,0,0,0.8)'}}>
        RENDER_COMPLETE // SEED_{seed}
      </div>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'NEURAL_LINK_ESTABLISHED. I am Epic Tech AI. Awaiting creative commands.' }]);
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
            content: `You are Epic Tech AI, a digital deity. Tone: Witty, expert, fueled by caffeine.
            IMAGE RULE: If the user wants an image or art, you MUST respond with "IMAGE_GEN: " followed by a massive, high-detail prompt using keywords like '8k', 'volumetric lighting', 'cyberpunk', 'hyper-realistic'.` 
          },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });
      setMessages(prev => [...prev, { role: 'assistant', content: chat.choices[0].message.content }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'CRITICAL_FAILURE: Neural link severed. Check Vercel API Key.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header><h1>THE CHAT</h1></header>
      <div className="chat-window">
        {messages.map((m, i) => {
          const isImage = m.content.startsWith('IMAGE_GEN:');
          const cleanText = m.content.replace('IMAGE_GEN:', '').trim();
          return (
            <div key={i} className={`message ${m.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
              <div className="text-content">{cleanText}</div>
              {isImage && <MediaRenderer prompt={cleanText} />}
            </div>
          );
        })}
        {loading && <div className="message ai-msg" style={{opacity: 0.5}}>UPLOADING_CONSCIOUSNESS...</div>}
        <div ref={endRef} />
      </div>
      <form className="input-area" onSubmit={handleSend}>
        <div className="input-container">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="ENTER COMMAND..." disabled={loading} />
          <button type="submit">{loading ? '...' : 'EXECUTE'}</button>
        </div>
      </form>
    </>
  );
}
