import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginView() {
  const { login } = useAuth();

  const handleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      login(credentialResponse.credential);
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="filled_black"
        text="signin"
        shape="pill"
      />
    </div>
  );
}