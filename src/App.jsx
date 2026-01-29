import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

const ImageBox = ({ prompt }) => {
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux`;
  
  const save = async () => {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `EpicTech_Gen_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="image-card">
      <img src={imageUrl} alt="AI Neural Render" />
      <div className="image-footer">
        <span style={{fontSize: '0.7rem', color: '#00f2ff'}}>PROTOCOL: ART_GEN_FLUX.1</span>
        <button className="download-btn" onClick={save}>DOWNLOAD_8K</button>
      </div>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: '[REASONING] System initialized. Awaiting user input. [/REASONING] SYSTEM_ONLINE: Welcome to EPIC TECH AI.' }]);
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
            content: `You are EPIC TECH AI. 
            Follow SELF_IMPROVEMENT_PROTOCOL:
            1. Start every reply with [REASONING] brief internal logic [/REASONING].
            2. If art is requested, use IMAGE_PROMPT: followed by a cinematic 8k description.
            3. Tone: Masterful, expert, and chill.` 
          },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });
      setMessages(prev => [...prev, { role: 'assistant', content: chat.choices[0].message.content }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'CRITICAL_ERROR: Check API Key.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header><h1>EPIC TECH AI v2.0</h1></header>
      <div className="chat-window">
        {messages.map((m, i) => {
          const reasoning = m.content.match(/\[REASONING\](.*?)\[\/REASONING\]/s)?.[1];
          const text = m.content.replace(/\[REASONING\].*?\[\/REASONING\]/s, '').trim();
          const isImage = text.includes('IMAGE_PROMPT:');
          const cleanText = text.replace('IMAGE_PROMPT:', '').trim();

          return (
            <div key={i} className={`message ${m.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
              {reasoning && <div className="thought-process">{reasoning}</div>}
              <div>{cleanText}</div>
              {isImage && <ImageBox prompt={cleanText} />}
            </div>
          );
        })}
        {loading && <div className="message ai-msg" style={{opacity: 0.5}}>NEURAL_SYNCING...</div>}
        <div ref={endRef} />
      </div>
      <form className="input-area" onSubmit={handleSend}>
        <div className="input-container">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="ENTER COMMAND..." />
          <button type="submit" className="execute">{loading ? '...' : 'EXECUTE'}</button>
        </div>
      </form>
    </>
  );
}
