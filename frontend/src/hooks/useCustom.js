import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const useProtectedRoute = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return false;
    }
    return true;
  }, [navigate]);

  return { checkAuth };
};

export const useAuth = () => {
  const isAuthenticated = localStorage.getItem('accessToken') !== null;
  return { isAuthenticated };
};

export const useSocket = (io, roomId) => {
  const socketRef = useCallback(() => {
    if (io && roomId) {
      const socket = io.connect('http://localhost:5000');
      socket.emit('join-auction', roomId);
      return socket;
    }
  }, [io, roomId]);

  return socketRef;
};
