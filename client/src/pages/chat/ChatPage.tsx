import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Image as ImageIcon, MessageCircle, Paperclip, Send, ShieldCheck, Trash2, Video, X } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Message {
  id?: string;
  senderId?: string;
  senderNickname: string;
  content: string;
  media?: {
    fileId: string;
    mimeType: string;
    originalName: string;
    size: number;
  };
  createdAt: string;
}

const ROOM_ID = 'peer-support-general';
const MAX_MEDIA_SIZE = 20 * 1024 * 1024;
const acceptedMediaTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
]);

const ChatMedia = ({ media }: { media: NonNullable<Message['media']> }) => {
  const [source, setSource] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    let objectUrl = '';

    api
      .get(`/chat/media/${encodeURIComponent(media.fileId)}`, { responseType: 'blob' })
      .then((response) => {
        objectUrl = URL.createObjectURL(response.data);
        if (isCurrent) setSource(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        if (isCurrent) setFailed(true);
      });

    return () => {
      isCurrent = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [media.fileId]);

  if (failed) return <p className="mt-2 text-xs text-red-600">Unable to load this attachment.</p>;
  if (!source) return <p role="status" className="mt-2 text-xs text-slate-500">Loading attachment...</p>;

  return media.mimeType.startsWith('image/') ? (
    <img src={source} alt={media.originalName} className="chat-message-media mt-2 max-h-80 max-w-full rounded-xl object-contain" />
  ) : (
    <video src={source} controls preload="metadata" className="chat-message-media mt-2 max-h-80 w-full rounded-xl" aria-label={media.originalName} />
  );
};

export const ChatPage = () => {
  const { accessToken, user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isSending, setIsSending] = useState(false);
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
      setMessages((prev) => (msg.id && prev.some((item) => item.id === msg.id) ? prev : [...prev, msg]));
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

  const sendMessage = async () => {
    const content = input.trim();
    if ((!content && !selectedMedia) || isSending) return;

    if (selectedMedia) {
      setIsSending(true);
      setUploadError('');
      const formData = new FormData();
      formData.append('media', selectedMedia);
      formData.append('content', content);
      formData.append('isAnonymous', String(isAnonymous));

      try {
        const response = await api.post(`/chat/${ROOM_ID}/messages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const message: Message = response.data.data;
        setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
        setInput('');
        setSelectedMedia(null);
      } catch (error) {
        const message = error as { response?: { data?: { message?: string } } };
        setUploadError(message.response?.data?.message || 'Unable to send this attachment. Please try again.');
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (!socketRef.current) return;
    socketRef.current.emit('chat:message', { roomId: ROOM_ID, content, isAnonymous });
    setInput('');
  };

  const handleMediaSelection = (file?: File) => {
    setUploadError('');
    if (!file) return;
    if (!acceptedMediaTypes.has(file.type)) {
      setUploadError('Choose a JPEG, PNG, GIF, WebP, MP4, or WebM file.');
      return;
    }
    if (file.size > MAX_MEDIA_SIZE) {
      setUploadError('Media must be 20 MB or smaller.');
      return;
    }
    setSelectedMedia(file);
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
    <div className="chat-page">
      <Card className="chat-window flex h-full flex-col overflow-hidden p-0">
        <header className="chat-topbar">
          <div className="chat-room-heading">
            <div className="chat-room-icon"><MessageCircle className="h-5 w-5" /></div>
            <div>
              <p className="chat-eyebrow">PEER SUPPORT ROOM</p>
              <h1>Talk it out, together.</h1>
              <p className="chat-room-subtitle">A kind space to listen and be heard.</p>
            </div>
          </div>
          <label className="chat-anonymous-toggle">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              <strong>Anonymous</strong>
              <small>{user?.anonymousNickname || 'Use your peer nickname'}</small>
            </span>
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          </label>
        </header>

        <div className="chat-thread" role="log" aria-label="Peer support messages" aria-live="polite">
          {messages.length === 0 && typing.length === 0 && (
            <div className="chat-empty-state">
              <div className="chat-empty-icon"><MessageCircle className="h-6 w-6" /></div>
              <h2>A little room to breathe</h2>
              <p>Start with what is on your mind. You can send a message, photo, or video.</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isOwn = Boolean(msg.senderId && user?.id === msg.senderId);
            const displayName = isOwn ? 'You' : msg.senderNickname;
            const avatarInitial = (isOwn ? user?.firstName : msg.senderNickname)?.charAt(0).toUpperCase() || '?';

            return (
              <div key={msg.id || i} className={`chat-message-row ${isOwn ? 'is-own' : ''}`}>
                <div className={`chat-avatar ${isOwn ? 'chat-avatar-own' : ''}`} aria-hidden="true">{avatarInitial}</div>
                <div className="chat-message-column">
                  <div className={`chat-message-meta ${isOwn ? 'is-own' : ''}`}>
                    <span>{displayName}</span>
                    <time dateTime={msg.createdAt}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
                    {isOwn && msg.id && (
                      <button type="button" onClick={() => deleteMessage(msg.id!)} className="chat-delete-button" aria-label="Delete message">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className={`chat-bubble ${isOwn ? 'chat-bubble-own' : ''}`}>
                    {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                    {msg.media && <ChatMedia media={msg.media} />}
                  </div>
                </div>
              </div>
            );
          })}
          {typing.length > 0 && (
            <div className="chat-typing-row" role="status">
              <span className="chat-typing-dots"><i /><i /><i /></span>
              <span>{typing.join(', ')} typing</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <footer className="chat-composer">
          {selectedMedia && (
            <div className="chat-attachment-chip">
              {selectedMedia.type.startsWith('image/') ? <ImageIcon className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              <span>{selectedMedia.name} · {(selectedMedia.size / (1024 * 1024)).toFixed(1)} MB</span>
              <button type="button" onClick={() => setSelectedMedia(null)} aria-label="Remove attachment"><X className="h-4 w-4" /></button>
            </div>
          )}
          {uploadError && <p role="alert" className="chat-upload-error">{uploadError}</p>}
          <div className="chat-compose-row">
            <label htmlFor="chat-media" title="Attach an image or video" aria-label="Attach an image or video" className="chat-attach-button">
              <Paperclip className="h-5 w-5" />
            </label>
            <input
              id="chat-media"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
              className="sr-only"
              onChange={(event) => {
                handleMediaSelection(event.currentTarget.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
            <input
              value={input}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), void sendMessage())}
              placeholder="Write a supportive message..."
              className="chat-input"
              maxLength={2000}
            />
            <Button onClick={() => void sendMessage()} disabled={(!input.trim() && !selectedMedia) || isSending} loading={isSending} aria-label="Send message" className="chat-send-button">
              {!isSending && <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="chat-composer-note">A little kindness goes a long way. Images and videos up to 20 MB.</p>
        </footer>
      </Card>
    </div>
  );
};
