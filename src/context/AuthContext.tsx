import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  business: any;
  user: any;
  role: string | null;
  loading: boolean;
  isUnlocked: boolean;
  unlock: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlock = (password: string) => {
    const masterPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'bilillee_admin_2024';
    if (password === masterPassword) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      // Removed the fallback logic to strictly enforce authentication.
      // Users must have an active session to proceed.
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        
        // Fetch Profile for Role and Data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setRole(profile.role);
          setUser({ ...session.user, ...profile }); // Merge profile into user object
          if (profile.tenant_id) {
             const { data: biz } = await supabase
               .from('shops')
               .select('*')
               .eq('id', profile.tenant_id)
               .single();
             if (biz) setBusiness(biz);
          }
        }
      }
      
      setLoading(false);
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setRole(profile.role);
          setUser({ ...session.user, ...profile });
        }
      } else {
        setUser(null);
        setBusiness(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ business, user, role, loading, isUnlocked, unlock }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
