import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  displayName: string;
  role?: string;
  badgeId?: string;
  email?: string;
  department?: string;
  avatarBg?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  displayName: string;
  initials: string;
  role: string;
  login: (investigatorId: string, extra?: Partial<User>) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * Derives 1-2 character initials from an investigator name or handle.
 * Handles:
 * - "R. Okafor" -> "RO"
 * - "Girish Garg" -> "GG"
 * - "girish.g" -> "GG"
 * - "s.petrov" -> "SP"
 * - "admin" -> "AD"
 * - "ro" -> "RO"
 * - "—" or empty -> "—"
 */
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '—';
  const clean = name.trim();

  // Split on whitespace, dot, underscore, or hyphen
  const parts = clean.split(/[\s._\-]+/).filter(p => p.length > 0);

  if (parts.length >= 2) {
    const first = parts[0].charAt(0).toUpperCase();
    const second = parts[1].charAt(0).toUpperCase();
    return `${first}${second}`;
  }

  if (parts.length === 1) {
    const single = parts[0];
    if (single.length >= 2) {
      return single.slice(0, 2).toUpperCase();
    }
    return single.charAt(0).toUpperCase();
  }

  return '—';
}

const STORAGE_KEY = 'tessera_currentUser';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      // Initial default state if previously logged in or seed state
      return {
        displayName: 'R. Okafor',
        role: 'Lead Investigator',
        badgeId: 'INV-4092-CYBER',
        department: 'Cyber Forensics & Incident Response'
      };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  const login = (investigatorId: string, extra?: Partial<User>) => {
    const cleanId = investigatorId.trim();
    if (!cleanId) return;

    const user: User = {
      displayName: cleanId,
      role: extra?.role || 'Lead Investigator',
      badgeId: extra?.badgeId || `INV-${Math.floor(1000 + Math.random() * 9000)}-CYBER`,
      email: extra?.email || `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '')}@state.cybercrime.gov.in`,
      department: extra?.department || 'State Cyber Crime Investigation Division',
      ...extra,
    };

    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setCurrentUser(prev => {
      if (!prev) {
        return {
          displayName: updates.displayName || 'Guest',
          role: updates.role || 'Lead Investigator',
          ...updates,
        };
      }
      return { ...prev, ...updates };
    });
  };

  const displayName = currentUser?.displayName || 'Guest';
  const initials = currentUser?.displayName ? getInitials(currentUser.displayName) : '—';
  const role = currentUser?.role || 'Lead Investigator';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        displayName,
        initials,
        role,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
