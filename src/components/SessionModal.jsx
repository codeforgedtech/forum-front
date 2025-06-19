import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import getTokenExpiration from '../utils/getTokenExpiration';

const SessionModal = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token) return;

    const expiration = getTokenExpiration(token);
    if (!expiration) return;

    const timeLeft = expiration - Date.now();
    setRemainingTime(Math.floor(timeLeft / 1000));

    const modalShowTime = expiration - 60000; // visa modal 60 sek innan

    const modalTimer = setTimeout(() => setShowModal(true), modalShowTime - Date.now());
    const logoutTimer = setTimeout(() => {
      onLogout();
      navigate('/login');
    }, timeLeft);

    const interval = setInterval(() => {
      const secondsLeft = Math.floor((expiration - Date.now()) / 1000);
      setRemainingTime(secondsLeft > 0 ? secondsLeft : 0);
    }, 1000);

    return () => {
      clearTimeout(modalTimer);
      clearTimeout(logoutTimer);
      clearInterval(interval);
    };
  }, [token]);

  if (!showModal) return null;

  return (
    <Modal>
      <h2 className="text-lg font-semibold">Du loggas snart ut</h2>
      <p className="mt-2">Du loggas ut om {remainingTime} sekunder.</p>
    </Modal>
  );
};

export default SessionModal;
