"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PortalUser {
  id: string;
  email: string;
  name: string | null;
}

interface PortalContextType {
  user: PortalUser | null;
  loading: boolean;
  login: (user: PortalUser) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/portal/auth');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = (newUser: PortalUser) => {
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await fetch('/api/portal/auth', { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  return (
    <PortalContext.Provider value={{ user, loading, login, logout, checkSession }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
