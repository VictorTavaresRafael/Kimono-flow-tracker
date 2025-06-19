import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const AuthDebug = () => {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    console.log('AuthDebug - currentUser:', currentUser);
    console.log('AuthDebug - loading:', loading);
  }, [currentUser, loading]);

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded text-sm z-50">
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {currentUser ? 'logged in' : 'not logged in'}</div>
      <div>Email: {currentUser?.email || 'none'}</div>
    </div>
  );
};

export default AuthDebug;
