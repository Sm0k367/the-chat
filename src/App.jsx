import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

const ImageBox = ({ prompt }) => {
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux`;
  return (
    <div className="image-card">
      <img src={imageUrl} alt="AI Gen" />
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Neural link established. What are we creating today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  // --- VOICE SYNTHESIS (Bot Talking) ---
  const speak = (text) => {
    const cleanText = text.replace(/IMAGE_PROMPT:.*$/s, ''); // Don't speak the image prompt
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.1; // Slightly faster, cooler tone
    utterance.pitch = 0.9; // Deeper, techier voice
    window.speechSynthesis.speak(utterance);
  };

  // --- SPEECH RECOGNITION (User Talking) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-send after speaking? You can call handleSend(null, transcript) here.
    };
    
    recognition.start();
  };

  const handleSend = async (e, voiceInput = null) => {
    if (e) e.preventDefault();
    const messageContent = voiceInput || input;
    if (!messageContent.trim() || loading) return;

    const userMsg = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chat = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: `You are EPIC TECH AI. Vibe: High-end, sleek, confident. No technical filler. 
            IMAGE TRIGGER: If asked for art, use IMAGE_PROMPT: [description].` 
          },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });
      const aiResponse = chat.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      speak(aiResponse); // Bot talks back!
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="root-inner">
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
        {loading && <div className="message ai-msg pulse">...</div>}
        <div ref={endRef} />
      </div>

      <form className="input-area" onSubmit={handleSend}>
        <div className="input-container">
          <button 
            type="button" 
            className={`action-btn mic-btn ${isListening ? 'active' : ''}`} 
            onClick={startListening}
          >
            <i className="fas fa-microphone"></i>
          </button>
          
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Talk or type..." 
          />
          
          <button type="submit" className="action-btn">
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
}
