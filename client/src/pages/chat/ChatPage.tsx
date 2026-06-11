import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Trash2 } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Message {
  id?: string;
  senderId?: string;
  senderNickname: string;
  content: string;
  createdAt: string;
}

const ROOM_ID = 'peer-support-general';

export const ChatPage = () => {
  const { accessToken, user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get(`/chat/${ROOM_ID}/history`).then((res) => {
      const history = (res.data.data || []).map((message: any) => ({
        ...message,
        id: message._id,
        senderId: message.senderId?.toString?.() ?? undefined,
      }));
      setMessages(history);
    });

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token: accessToken },
    });
    socketRef.current = socket;

    socket.emit('chat:join', ROOM_ID);

    socket.on('chat:message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('chat:deleted', ({ id }: { id: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    socket.on('chat:typing', ({ nickname, isTyping }: { nickname: string; isTyping: boolean }) => {
      setTyping((prev) =>
        isTyping ? [...new Set([...prev, nickname])] : prev.filter((n) => n !== nickname)
      );
    });

    return () => { socket.disconnect(); };
  }, [accessToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('chat:message', { roomId: ROOM_ID, content: input, isAnonymous });
    setInput('');
  };

  const deleteMessage = (id: string) => {
    if (!socketRef.current) return;
    const confirmed = window.confirm('Delete this message? This cannot be undone.');
    if (!confirmed) return;
    socketRef.current.emit('chat:delete', { messageId: id });
  };

  const handleTyping = (value: string) => {
    setInput(value);
    socketRef.current?.emit('chat:typing', { roomId: ROOM_ID, isTyping: value.length > 0 });
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)]">
      <Card title="Peer Support Chat" subtitle="A safe space for anonymous peer connection" className="h-full flex flex-col">
        <label className="flex items-center gap-2 text-sm mb-4">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          Send as anonymous ({user?.anonymousNickname})
        </label>
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[300px]">
          {messages.map((msg, i) => (
            <div key={msg.id || i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-calm-100 dark:bg-calm-900/30 flex items-center justify-center text-sm font-medium shrink-0">
                {msg.senderNickname[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">{msg.senderNickname} · {new Date(msg.createdAt).toLocaleTimeString()}</p>
                  {msg.senderId && user?.id === msg.senderId && msg.id && (
                    <button
                      type="button"
                      onClick={() => deleteMessage(msg.id!)}
                      className="text-slate-400 hover:text-red-500"
                      aria-label="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1 p-3 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {typing.length > 0 && (
            <p className="text-xs text-slate-400 italic">{typing.join(', ')} typing...</p>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a supportive message..."
            className="input-field flex-1"
            maxLength={2000}
          />
          <Button onClick={sendMessage} disabled={!input.trim()}><Send className="w-4 h-4" /></Button>
        </div>
      </Card>
    </div>
  );
};
