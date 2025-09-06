import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { syncUserData } from '../utils/socialAuthHelpers';
import { toast } from 'react-toastify';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const error = hashParams.get('error');

        if (error) {
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }

        if (accessToken) {
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          const userInfo = await userResponse.json();
          const userData = await syncUserData(userInfo.email, {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            provider: 'Google'
          });

          login(userData);
          toast.success(`Welcome, ${userData.fullName}!`);
          window.location.href = '/dashboard';
        } else {
          throw new Error('No access token found');
        }
      } catch (error) {
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Completing authentication...</p>
    </div>
  );
};

export default AuthCallback;