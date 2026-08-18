'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, Mic } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente virtual de AluminéGO, parte del ecosistema digital de ADNQN, diseñado para acompañarte en tu experiencia por nuestra región. Antes de comenzar, ¿cuál es tu nombre para poder dirigirirme a ti?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Create a ref to store the latest handleSend function to avoid stale closures in event listeners
  const latestHandleSend = useRef<((text: string, isVoice: boolean) => void) | null>(null);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    setMounted(true);
    const savedName = sessionStorage.getItem('alumine_chat_username');
    if (savedName) {
      setUserName(savedName);
    }
    
    const savedHistory = sessionStorage.getItem('alumine_chat_history');
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    } else if (savedName) {
      // If name is saved but no history, start with standard personalized greeting
      setMessages([
        {
          role: 'assistant',
          content: `¡Hola ${savedName}! Soy el asistente virtual de AluminéGO, parte del ecosistema digital de ADNQN. ¿En qué te puedo ayudar hoy?`
        }
      ]);
    } else {
      // No name, start with onboarding greeting
      setMessages([
        {
          role: 'assistant',
          content: '¡Hola! Soy el asistente virtual de AluminéGO, parte del ecosistema digital de ADNQN, diseñado para acompañarte en tu experiencia por nuestra región. Antes de comenzar, ¿cuál es tu nombre para poder dirigirme a ti?'
        }
      ]);
    }

    // Setup Web Speech API SpeechRecognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = 'es-AR'; // Optimize transcription for Argentine Spanish
        rec.interimResults = false;

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            // Immediately send the recognized text if possible
            if (latestHandleSend.current) {
               latestHandleSend.current(transcript, true);
            } else {
               setInput(prev => prev + (prev ? ' ' : '') + transcript);
            }
          }
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Save history to sessionStorage
  const saveHistory = (newMessages: Message[]) => {
    setMessages(newMessages);
    sessionStorage.setItem('alumine_chat_history', JSON.stringify(newMessages));
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('La función de dictado por voz no es compatible o no está permitida en este navegador. Te recomendamos usar Google Chrome o Safari.');
      return;
    }

    // Cancel any ongoing AI text-to-speech reading if the user presses the mic
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSend = async (textToSend: string, isVoiceMode = false) => {
    if (!textToSend.trim() || isSending) return;

    // Stop listening if we were recording voice
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Helper to read text aloud
    const readAloud = (text: string) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Strip markdown and links for clean speech
        const cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_~`#]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'es-AR'; // Use Argentine Spanish
        window.speechSynthesis.speak(utterance);
      }
    };

    // Check if name is set. If not, this first message is the user's name!
    if (!userName) {
      const name = textToSend.trim();
      setUserName(name);
      sessionStorage.setItem('alumine_chat_username', name);
      
      const userMessage: Message = { role: 'user', content: name };
      const welcomeMessage: Message = { 
        role: 'assistant', 
        content: `¡Un placer conocerte, ${name}! ¿En qué te puedo ayudar hoy sobre Aluminé o Moquehue?` 
      };
      
      if (isVoiceMode) {
        readAloud(welcomeMessage.content);
      }
      
      const updatedMessages = [...messages, userMessage, welcomeMessage];
      saveHistory(updatedMessages);
      setInput('');
      return;
    }

    const userMessage: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    saveHistory(updatedMessages);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, userName })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          if (isVoiceMode) {
            readAloud(data.reply);
          }
          saveHistory([...updatedMessages, { role: 'assistant', content: data.reply }]);
        }
      } else {
        saveHistory([...updatedMessages, { role: 'assistant', content: `Lo siento ${userName}, en este momento el soporte de AluminéGO está experimentando inconvenientes. Intenta de nuevo más tarde.` }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      saveHistory([...updatedMessages, { role: 'assistant', content: `Hubo un error de conexión, ${userName}. Por favor verifica tu internet e intenta nuevamente.` }]);
    } finally {
      setIsSending(false);
    }
  };

  // Update the ref to the latest handleSend every render
  latestHandleSend.current = handleSend;

  if (!mounted) return null;

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const renderMessageContent = (text: string) => {
    // Regex for Markdown links: [Text](URL)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a 
          key={match.index} 
          href={match[2]} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: 'var(--color-orange)', fontWeight: 'bold', textDecoration: 'underline' }}
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    if (parts.length === 0) {
      return text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }
    
    return parts.map((part, index) => {
      if (typeof part === 'string') {
        return part.split('\n').map((line, i) => (
          <React.Fragment key={`${index}-${i}`}>
            {line}
            {i < part.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
      }
      return part;
    });
  };

  const suggestions = [
    "¿Qué puedo hacer en Aluminé? 🚣",
    "Buscar cabañas para hospedarme 🏡",
    "Recomiéndame dónde comer 🍕",
    "Contacto comercial / Anunciar 📱"
  ];

  return (
    <>
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          {/* Spinning Ring */}
          <div 
            className="chat-bubble-spinner"
            style={{
              position: 'absolute',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '2px dashed #22c55e',
              animation: 'spin 12s linear infinite',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.2)',
              pointerEvents: 'none'
            }}
          />

          {/* Sparkle Star 1 */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            color: '#22c55e',
            fontSize: '10px',
            animation: 'pulseSparkle 2s infinite ease-in-out',
            pointerEvents: 'none',
            fontWeight: 'bold'
          }}>
            ✦
          </div>

          {/* Sparkle Star 2 */}
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            color: '#22c55e',
            fontSize: '8px',
            animation: 'pulseSparkle 2.5s infinite ease-in-out 0.5s',
            pointerEvents: 'none',
            fontWeight: 'bold'
          }}>
            ✦
          </div>

          {/* Sparkle Star 3 (Top Right) */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '6px',
            color: '#22c55e',
            fontSize: '7px',
            animation: 'pulseSparkle 1.8s infinite ease-in-out 1s',
            pointerEvents: 'none',
            fontWeight: 'bold'
          }}>
            ✦
          </div>

          {/* Actual Button */}
          <button 
            onClick={() => setIsOpen(true)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-green) 0%, #1e4d3d 100%)',
              border: '2px solid white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
            }}
            title="Asistente Virtual"
          >
            <img src="/images/bot-icon.jpg" alt="Asistente" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* Status Indicator Dot */}
            <span style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              border: '1.2px solid white'
            }} />
          </button>
        </div>
      )}

      {/* Expanded Chat Widget */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '520px',
            maxHeight: 'calc(100vh - 120px)',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-green) 0%, #1e4d3d 100%)',
            padding: '16px 20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img src="/images/bot-icon.jpg" alt="Asistente" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  border: '1.5px solid var(--color-green)'
                }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, letterSpacing: '0.3px' }}>Asistente AluminéGO</h4>
                <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block', marginTop: '1px' }}>Ecosistema digital ADNQN</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages List */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: '#f8fafc'
          }}>
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div 
                  key={index} 
                  style={{
                    alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: isAssistant ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                    backgroundColor: isAssistant ? 'white' : 'var(--color-orange)',
                    color: isAssistant ? '#1e293b' : 'white',
                    fontSize: '0.92rem',
                    lineHeight: '1.45',
                    boxShadow: isAssistant ? '0 2px 4px rgba(0,0,0,0.02)' : '0 2px 6px rgba(211,84,0,0.2)',
                    border: isAssistant ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    wordBreak: 'break-word'
                  }}>
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              );
            })}
            
            {/* Loading / Typing indicator */}
            {isSending && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '16px', backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                <Loader2 className="animate-spin" size={16} style={{ color: 'var(--color-green)' }} />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Pensando...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (rendered when not loading, input is empty and name is set) */}
          {!isSending && userName && input.trim() === '' && (
            <div style={{
              padding: '10px 16px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid rgba(0,0,0,0.04)',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none'
            }}>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '50px',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-orange)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'var(--color-orange)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            style={{
              padding: '14px 16px',
              backgroundColor: 'white',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {/* Voice Input Button */}
            {mounted && typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) && (
              <button
                type="button"
                onClick={toggleListening}
                style={{
                  border: 'none',
                  background: isListening ? '#ef4444' : '#f1f5f9',
                  color: isListening ? 'white' : '#64748b',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                className={isListening ? "animate-pulse" : ""}
                title={isListening ? "Escuchando... Haz clic para detener" : "Dictar por voz"}
              >
                <Mic size={16} />
              </button>
            )}

            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              placeholder={isListening ? "Escuchando tu voz..." : (!userName ? "Escribe tu nombre..." : "Pregúntame sobre Aluminé...")}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.94rem',
                color: '#1e293b',
                padding: '6px 0'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              style={{
                border: 'none',
                background: input.trim() && !isSending ? 'var(--color-orange)' : '#f1f5f9',
                color: input.trim() && !isSending ? 'white' : '#94a3b8',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isSending ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseSparkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.7) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.3) rotate(180deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
}
