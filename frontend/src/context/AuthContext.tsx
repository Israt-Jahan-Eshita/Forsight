import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Role = 'admin' | 'teacher' | 'student' | null;

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface AuthContextType {
  role: Role;
  user: User | null;
  token: string | null;
  login: (emailOrRole: string, password?: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, role: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Initialize Auth state from LocalStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('fs_token');
    const savedUserJson = localStorage.getItem('fs_user');
    
    if (savedToken && savedUserJson) {
      try {
        const savedUser = JSON.parse(savedUserJson) as User;
        setToken(savedToken);
        setUser(savedUser);
        setRole(savedUser.role.toLowerCase() as Role);
      } catch (e) {
        localStorage.removeItem('fs_token');
        localStorage.removeItem('fs_user');
      }
    }
  }, []);

  const login = async (emailOrRole: string, password?: string) => {
    // If no password is provided, act as a mock preview login for developer convenience
    if (!password) {
      const mockRole = emailOrRole.toLowerCase() as Role;
      const mockUser: User = {
        id: 999,
        name: mockRole === 'admin' ? 'Super Admin' : mockRole === 'teacher' ? 'Mr. Rahim' : 'Sara Rahman',
        email: mockRole === 'admin' ? 'admin@school.edu' : mockRole === 'teacher' ? 'rahim@school.edu' : 'sara@student.edu',
        role: mockRole ? mockRole.toUpperCase() : 'STUDENT',
        status: 'Active'
      };
      
      setToken('mock-jwt-token');
      setUser(mockUser);
      setRole(mockRole);
      
      localStorage.setItem('fs_token', 'mock-jwt-token');
      localStorage.setItem('fs_user', JSON.stringify(mockUser));
      return;
    }

    // Otherwise, perform actual Spring Boot backend JWT request
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: emailOrRole, password }),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || 'Failed to authenticate');
    }

    const data = await response.json(); // { token, rawPassword, user }
    
    setToken(data.token);
    setUser(data.user);
    setRole(data.user.role.toLowerCase() as Role);

    localStorage.setItem('fs_token', data.token);
    localStorage.setItem('fs_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, role: string) => {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Protected endpoint
      },
      body: JSON.stringify({ name, email, role }),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || 'Failed to register account');
    }

    return await response.json(); // returns { token, rawPassword, user }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('fs_token');
    localStorage.removeItem('fs_user');
  };

  return (
    <AuthContext.Provider value={{ role, user, token, login, logout, register }}>
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
