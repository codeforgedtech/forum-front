// pages/Register.jsx
import { useState } from 'react';
import api from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import React from 'react'
import { useTheme} from '../utils/ThemeContext';
import { ToastContainer, toast } from 'react-toastify';
export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
 const { darkMode } = useTheme();
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('http://localhost:8001/auth/register', {
        username,
        email,
        password
      });
      toast.success('Registreringen lyckades!');
      navigate('/login');
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error('Registreringen misslyckades. Kontrollera att alla fält är ifyllda.');
    }
  };

  return (
    <form onSubmit={handleRegister} className={`space-y-4 max-w-sm mx-auto mt-10 p-6 rounded shadow-md transition-all duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
    }`}>
      <h1 className="text-2xl font-bold">Registrera dig</h1>
      <input
        type="text"
        value={username}
        placeholder="Användarnamn"
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="email"
        value={email}
        placeholder="E-postadress"
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="password"
        value={password}
        placeholder="Lösenord"
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Skapa konto
      </button>
    </form>
  );
}


