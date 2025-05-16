// pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React from 'react';
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8001/auth/login', {
        username,
        password
      });
      localStorage.setItem('authToken', res.data.token); 
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.token);
      navigate('/'); // Vid lyckad inloggning
    } catch (err) {
      // Kolla om det �r ett serverfel eller om n�got annat gick fel
      console.error('Login error:', err.response ? err.response.data : err);
      setError('Fel anv�ndarnamn eller l�senord.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto mt-10">
      <h1 className="text-xl font-bold">Logga in</h1>
      <input
        type="text"
        placeholder="Användarnamn"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Lösenord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full border p-2 rounded"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Logga in
      </button>
    </form>
  );
}


