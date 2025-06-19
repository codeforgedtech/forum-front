// pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import React from 'react';
import { toast } from 'react-toastify';
import { useTheme} from '../utils/ThemeContext';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error] = useState('');
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('http://localhost:8001/auth/login', {
        username,
        password,
      });
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.token);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err);
      toast.error('Fel användarnamn eller lösenord.');
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className={`space-y-4 max-w-sm mx-auto mt-10 p-6 rounded shadow-md transition-all duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <h1 className="text-xl font-bold">Logga in</h1>
      <input
        type="text"
        placeholder="Användarnamn"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className={`w-full border p-2 rounded ${
          darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      />
      <input
        type="password"
        placeholder="Lösenord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className={`w-full border p-2 rounded ${
          darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Logga in
      </button>
    </form>
  );
}



