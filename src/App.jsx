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
      <img src={imageUrl} alt="Neural Render" />
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Neural link established. What are we creating today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  // --- PERFECT VOICE INITIALIZATION ---
  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/IMAGE_PROMPT:.*$/gs, '').trim(); 
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Selecting the "Premium" Neural Voice
    const premiumVoice = voices.find(v => 
      v.name.includes('Google US English') || 
      v.name.includes('Aria') || 
      v.name.includes('Samantha') ||
      v.name.includes('Natural')
    );

    if (premiumVoice) utterance.voice = premiumVoice;
    utterance.rate = 1.05; 
    utterance.pitch = 0.95; 
    window.speechSynthesis.speak(utterance);
  };

  // --- SPEECH RECOGNITION (Mic Logic) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser voice support not detected.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    
    recognition.start();
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
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
            content: `You are EPIC TECH AI by Sm0ken42O. 
            Vibe: Ultra-sleek, confident, expert. 
            No technical reasoning blocks or extra filler text.
            If the user wants art, respond ONLY with "IMAGE_PROMPT: " followed by the prompt.` 
          },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const response = chat.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      speak(response);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection Severed.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="root-inner">
      <header>
        <h1>EPIC TECH AI</h1>
      </header>
      
      <div className="chat-window">
        {messages.map((m, i) => {
          const isImage = m.content.includes('IMAGE_PROMPT:');
          const cleanText = m.content.replace('IMAGE_PROMPT:', '').trim();

          return (
            <div key={i} className={`message ${m.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
              <div className="text-body">{cleanText}</div>
              {isImage && <ImageBox prompt={cleanText} />}
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
            <i className={`fas ${isListening ? 'fa-circle-dot' : 'fa-microphone'}`}></i>
          </button>
          
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Talk or type command..." 
            disabled={loading}
          />
          
          <button type="submit" className="action-btn" disabled={loading}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
}
