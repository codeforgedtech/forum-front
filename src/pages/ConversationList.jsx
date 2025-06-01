import { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';

export default function ConversationList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get('http://localhost:8001/messages/conversations', {
        withCredentials: true,
      });
      setConversations(response.data);
    } catch (err) {
      console.error('Kunde inte hämta konversationer:', err);
    }
  };

  return (
    <div className="border p-4 rounded w-1/3">
      <h2 className="text-lg font-semibold mb-3">Meddelanden</h2>
      <ul className="space-y-2">
        {conversations.map((conv) => (
          <li
            key={conv.participant_id}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
            onClick={() =>
              onSelectConversation({ id: conv.participant_id, username: conv.username })
            }
          >
            <div className="font-semibold">{conv.username}</div>
            <div className="text-sm text-gray-600 truncate">{conv.content}</div>
            <div className="text-xs text-gray-400">{new Date(conv.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

