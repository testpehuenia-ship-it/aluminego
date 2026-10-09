'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';

interface RadioConfig {
  streamUrl: string;
  fallbackStreamUrl?: string;
  name: string;
  frequency: string;
  slogan: string;
  city: string;
  isActive: boolean;
}

export default function RadioPlayer() {
  const [config, setConfig] = useState<RadioConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch radio config from API
    fetch('/api/radio')
      .then(res => res.json())
      .then(data => {
        if (data && data.isActive) {
          setConfig(data);
        }
      })
      .catch(err => console.error('Error cargando configuración de radio:', err));
  }, []);

  const getActiveStreamUrl = () => {
    if (!config) return '';
    return useFallback && config.fallbackStreamUrl ? config.fallbackStreamUrl : config.streamUrl;
  };

  const togglePlay = () => {
    if (!audioRef.current || !config) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setHasError(false);
      
      // Update src if not set or if toggling fallback
      const streamUrl = getActiveStreamUrl();
      if (!audioRef.current.src || audioRef.current.src !== streamUrl) {
        audioRef.current.src = streamUrl;
      }
      
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error reproduciendo stream principal:', err);
          // Try fallback if available and not already using it
          if (!useFallback && config.fallbackStreamUrl) {
            console.log('Intentando stream alternativo...');
            setUseFallback(true);
            if (audioRef.current) {
              audioRef.current.src = config.fallbackStreamUrl;
              audioRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  setIsLoading(false);
                })
                .catch(e => {
                  console.error('Error reproduciendo stream alternativo:', e);
                  setIsLoading(false);
                  setIsPlaying(false);
                  setHasError(true);
                });
            }
          } else {
            setIsLoading(false);
            setIsPlaying(false);
            setHasError(true);
          }
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!config || !config.isActive) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      borderRadius: '16px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: 'white',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      gap: '12px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow animation when playing */}
      {isPlaying && (
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
          animation: 'pulseGlow 3s infinite alternate',
          pointerEvents: 'none'
        }} />
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="none"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setHasError(true);
        }}
      />

      {/* Left icon with live pulse dot */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: isPlaying ? '#4f46e5' : 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          transition: 'all 0.3s ease'
        }}>
          <Radio size={22} className={isPlaying ? 'animate-pulse' : ''} />
        </div>
        {isPlaying && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            border: '2px solid #1e1b4b'
          }} />
        )}
      </div>

      {/* Center metadata */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            color: '#a5b4fc',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {isPlaying ? '🔴 EN VIVO' : 'RADIO EN VIVO'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: 600 }}>{config.frequency}</span>
        </div>
        <div style={{
          fontSize: '1.05rem',
          fontWeight: 800,
          fontFamily: 'var(--font-oswald), sans-serif',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginTop: '2px'
        }}>
          {config.name}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {config.slogan} • {config.city}
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
        {hasError && (
          <span title="Transmisión momentáneamente no disponible" style={{ color: '#ef4444', display: 'flex', alignItems: 'center' }}>
            <AlertCircle size={20} />
          </span>
        )}

        {isPlaying && (
          <button
            onClick={toggleMute}
            style={{
              background: 'none',
              border: 'none',
              color: '#a5b4fc',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'color 0.2s'
            }}
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )}

        <button
          onClick={togglePlay}
          disabled={isLoading}
          style={{
            backgroundColor: isPlaying ? '#ef4444' : '#6366f1',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }}
          title={isPlaying ? 'Pausar transmisión' : 'Escuchar en vivo'}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} style={{ marginLeft: '2px' }} />
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes pulseGlow {
          0% { transform: scale(0.95); opacity: 0.5; }
          100% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
