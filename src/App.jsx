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
      <img src={imageUrl} alt="AI Art Render" loading="lazy" />
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Epic Tech AI initialized. Ready for command.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  
  const chatWindowRef = useRef(null);
  const endRef = useRef(null);

  // --- SCROLL TO BOTTOM LOGIC ---
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // --- NEURAL VOICE SETUP ---
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    // Strip out the image prompt from being read out loud
    const cleanText = text.replace(/IMAGE_PROMPT:.*$/gs, '').trim(); 
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const premiumVoice = voices.find(v => 
      v.name.includes('Google US English') || v.name.includes('Aria') || v.name.includes('Samantha')
    );
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // --- WELCOME PROTOCOL ---
  useEffect(() => {
    if (voices.length > 0) {
      const timer = setTimeout(() => {
        speak("Neural link established. Sm0ken42O edition online. What are we creating today?");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [voices]);

  // --- SPEECH RECOGNITION ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice recognition not supported.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
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
            content: `You are EPIC TECH AI. Vibe: High-end, elite, sleek. 
            If the user asks for an image, respond ONLY with "IMAGE_PROMPT: " followed by the 8k description.` 
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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Link Error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="root-inner">
      <header>
        <h1>EPIC TECH AI</h1>
      </header>
      
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((m, i) => {
          const isImage = m.content.includes('IMAGE_PROMPT:');
          const cleanText = m.content.replace('IMAGE_PROMPT:', '').trim();
          return (
            <div key={i} className={`message ${m.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
              <div>{cleanText}</div>
              {isImage && <ImageBox prompt={cleanText} />}
            </div>
          );
        })}
        {loading && <div className="message ai-msg" style={{opacity: 0.5}}>...</div>}
        <div ref={endRef} />
      </div>

      <form className="input-area" onSubmit={handleSend}>
        <div className="input-container">
          <button 
            type="button" 
            className={`action-btn mic-btn ${isListening ? 'active' : ''}`} 
            onClick={startListening}
          >
            <i className={`fas ${isListening ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
          </button>
          
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Type or speak..." 
          />
          
          <button type="submit" className="action-btn">
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
}
