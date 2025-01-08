// components/AuthGuard.tsx
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PouchDB from 'pouchdb';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const db = new PouchDB('user_database');
      try {
        await db.get('user');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        history.replace('/login');
      }
    };
    
    checkAuth();
  }, [history]);

  if (isAuthenticated === null) {
    return null; // or loading spinner
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;