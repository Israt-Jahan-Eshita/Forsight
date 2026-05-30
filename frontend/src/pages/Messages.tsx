import { API_BASE_URL } from '../config';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Send, Search, Users, Reply, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Message {
  id: number;
  sender: User;
  receiver: User;
  content: string;
  timestamp: string;
  read?: boolean;
  reaction?: string;
  replyToId?: number;
}

export function Messages() {
  const location = useLocation();
  const { token, user } = useAuth();
  
  const targetUserFromState = location.state?.targetUser as User | undefined;

  const [activeContacts, setActiveContacts] = useState<User[]>([]);
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDirectory, setShowDirectory] = useState(false);
  
  const [newMsgContent, setNewMsgContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New UI states
  const [selectedMsgId, setSelectedMsgId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  useEffect(() => {
    fetchContactsAndDirectory();
  }, [token]);

  useEffect(() => {
    if (selectedContact) {
      fetchChatHistory();
    }
  }, [selectedContact, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContactsAndDirectory = async () => {
    try {
      if (!token || token === 'mock-jwt-token') {
        const mockUsers: User[] = [
          { id: 1, name: 'Super Admin', email: 'admin@school.edu', role: 'ADMIN' },
          { id: 2, name: 'Sara Rahman', email: 'sara@student.edu', role: 'STUDENT' },
          { id: 3, name: 'Rahim Khan', email: 'rahim@school.edu', role: 'TEACHER' }
        ].filter(u => u.email !== user?.email);

        setActiveContacts(mockUsers);
        setAllUsers(mockUsers);
        if (targetUserFromState) setSelectedContact(targetUserFromState);
        else if (mockUsers.length > 0) setSelectedContact(mockUsers[0]);
        return;
      }

      const contactsRes = await fetch(`${API_BASE_URL}/api/messages/contacts`, { headers: { 'Authorization': `Bearer ${token}` } });
      const contactsData: User[] = await contactsRes.json();
      setActiveContacts(contactsData);

      const usersRes = await fetch(`${API_BASE_URL}/api/messages/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      const usersData: User[] = await usersRes.json();
      setAllUsers(usersData);

      if (targetUserFromState) {
        setSelectedContact(targetUserFromState);
        if (!contactsData.some(c => c.id === targetUserFromState.id)) {
          setActiveContacts([targetUserFromState, ...contactsData]);
        }
      } else if (contactsData.length > 0) {
        setSelectedContact(contactsData[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChatHistory = async () => {
    if (!selectedContact) return;
    try {
      if (!token || token === 'mock-jwt-token') {
        setMessages([
          { id: 1, sender: selectedContact, receiver: user as User, content: 'Hello! I completed the practice quiz.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
          { id: 2, sender: user as User, receiver: selectedContact, content: 'Sure! Let\'s go through your answers.', timestamp: new Date().toISOString(), read: true }
        ]);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/messages/history/${selectedContact.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        setMessages(await response.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgContent.trim() || !selectedContact) return;

    try {
      const payload = {
        receiverId: selectedContact.id,
        content: newMsgContent,
        replyToId: replyingTo?.id
      };

      if (!token || token === 'mock-jwt-token') {
        const mockNew: Message = {
          id: messages.length + 1,
          sender: user as User,
          receiver: selectedContact,
          content: newMsgContent,
          timestamp: new Date().toISOString(),
          replyToId: replyingTo?.id,
          read: true
        };
        setMessages([...messages, mockNew]);
        setNewMsgContent('');
        setReplyingTo(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setNewMsgContent('');
        setReplyingTo(null);
        fetchChatHistory();
        
        const contactsRes = await fetch(`${API_BASE_URL}/api/messages/contacts`, { headers: { 'Authorization': `Bearer ${token}` } });
        setActiveContacts(await contactsRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReact = async (msgId: number) => {
    if (!token || token === 'mock-jwt-token') {
      setMessages(messages.map(m => m.id === msgId ? { ...m, reaction: m.reaction ? undefined : '❤️' } : m));
      return;
    }
    // We can add a patch endpoint later, just mock UI for now
    setMessages(messages.map(m => m.id === msgId ? { ...m, reaction: m.reaction ? undefined : '❤️' } : m));
  };

  const startNewChat = (target: User) => {
    setSelectedContact(target);
    setShowDirectory(false);
    if (!activeContacts.some(c => c.id === target.id)) setActiveContacts([target, ...activeContacts]);
  };

  const filteredContacts = activeContacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDirectory = allUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getRepliedMessage = (id?: number) => messages.find(m => m.id === id);

  return (
    <div className="animate-fade-in pb-20 max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
      
      {/* Contact Panel */}
      <Card className="w-full lg:w-80 p-0 flex flex-col overflow-hidden shrink-0 border border-white/50 bg-color-surface/90 neu-raised">
        <div className="p-4 border-b border-black/5 bg-color-surface/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-color-text font-serif">Inbox</h3>
            <Button size="sm" variant="secondary" className={`p-1.5 rounded-xl border-none ${showDirectory ? 'bg-color-accent text-white' : 'bg-color-accent/15 text-color-accent'}`} onClick={() => setShowDirectory(!showDirectory)}>
              <Users className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-color-muted" />
            <input type="text" placeholder={showDirectory ? "Search directory..." : "Search messages..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 neu-inset bg-color-background rounded-xl text-xs focus:outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showDirectory ? (
            <div className="p-2 space-y-1">
              <p className="text-[10px] font-bold text-color-muted uppercase pl-2 mb-2 tracking-wide">User Directory</p>
              {filteredDirectory.length === 0 ? <p className="text-xs text-color-muted italic p-4">No users found.</p> : (
                filteredDirectory.map((usr) => (
                  <div key={usr.id} onClick={() => startNewChat(usr)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-black/[0.02]">
                    <Avatar fallback={usr.name[0]} size="sm" />
                    <div>
                      <h4 className="text-xs font-bold text-color-text">{usr.name}</h4>
                      <p className="text-[10px] text-color-muted">{usr.role.toLowerCase()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            filteredContacts.map((chat) => {
              // Unread logic mock (just for UI demo)
              const hasUnread = false;
              return (
                <div key={chat.id} onClick={() => setSelectedContact(chat)} className={`flex items-center gap-3 p-4 border-b border-black/5 cursor-pointer ${selectedContact?.id === chat.id ? 'bg-black/[0.03] neu-inset' : 'hover:bg-black/[0.02]'}`}>
                  <div className="relative">
                    <Avatar fallback={chat.name[0]} size="md" />
                    {hasUnread && <div className="absolute top-0 right-0 w-3 h-3 bg-color-accent border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm text-color-text truncate ${hasUnread ? 'font-extrabold' : 'font-bold'}`}>{chat.name}</h4>
                    <p className="text-xs text-color-muted font-medium truncate mt-1">{chat.role.toLowerCase()}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Dynamic Chat Window */}
      {selectedContact ? (
        <Card className="flex-1 p-0 flex flex-col overflow-hidden border border-white/50 bg-color-surface/90 neu-raised relative">
          <div className="p-4 border-b border-black/5 bg-color-surface/50 flex items-center gap-3 z-10">
            <Avatar fallback={selectedContact.name[0]} size="sm" />
            <div>
              <h3 className="font-bold text-color-text font-serif">{selectedContact.name}</h3>
              <p className="text-[10px] text-color-muted font-semibold">{selectedContact.role.toLowerCase()}</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-color-background flex flex-col gap-4 relative">
            {messages.length === 0 ? (
              <p className="text-xs text-color-muted italic text-center mt-20">Send a message to start personal conversation.</p>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender.email === user?.email || msg.sender.id === 999;
                const isSelected = selectedMsgId === msg.id;
                const repliedMsg = getRepliedMessage(msg.replyToId);

                return (
                  <div key={msg.id} className={`max-w-[75%] relative group ${isMine ? 'self-end flex flex-col items-end' : 'self-start'}`}>
                    
                    {/* Reply Context */}
                    {repliedMsg && (
                      <div className="mb-1 text-[10px] opacity-70 bg-black/5 px-3 py-1.5 rounded-lg border-l-2 border-color-accent truncate max-w-full">
                        <span className="font-bold">{repliedMsg.sender.id === user?.id ? 'You' : repliedMsg.sender.name}:</span> {repliedMsg.content}
                      </div>
                    )}

                    <div 
                      onDoubleClick={() => handleReact(msg.id)}
                      onClick={() => setSelectedMsgId(isSelected ? null : msg.id)}
                      className={`p-3 rounded-2xl text-xs font-semibold cursor-pointer transition-all ${
                        isMine ? 'rounded-tr-sm bg-color-accent text-black shadow-sm' : 'rounded-tl-sm bg-color-surface text-black border border-black/5 neu-raised'
                      } ${isSelected ? 'ring-2 ring-color-accent/50' : ''}`}
                    >
                      {msg.content}
                    </div>

                    {/* Quick Action Overlays */}
                    <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? '-left-10' : '-right-10'}`}>
                      <button onClick={() => setReplyingTo(msg)} className="p-1 rounded-full hover:bg-black/10 text-color-muted"><Reply className="w-3.5 h-3.5" /></button>
                    </div>

                    {/* Reactions */}
                    {msg.reaction && (
                      <div className={`absolute -bottom-2 bg-white border border-black/5 text-xs rounded-full px-1.5 shadow-sm ${isMine ? 'left-2' : 'right-2'}`}>
                        {msg.reaction}
                      </div>
                    )}

                    {/* Tap Details */}
                    {isSelected && (
                      <span className="text-[9px] text-color-muted mt-1.5 px-1 font-bold animate-slide-up flex items-center gap-1">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        {isMine && <span className="text-color-accent">• {msg.read ? 'Read' : 'Delivered'}</span>}
                      </span>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Bar Overlay */}
          {replyingTo && (
            <div className="px-4 py-2 bg-color-surface/90 backdrop-blur border-t border-black/5 flex items-center justify-between text-xs absolute bottom-[72px] left-0 right-0 z-20 animate-slide-up">
              <div className="flex items-center gap-2 border-l-2 border-color-accent pl-2 truncate">
                <Reply className="w-3.5 h-3.5 text-color-accent" />
                <span className="font-bold truncate">Replying to {replyingTo.sender.id === user?.id ? 'Yourself' : replyingTo.sender.name}:</span>
                <span className="truncate opacity-70">{replyingTo.content}</span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-black/5 rounded-full"><X className="w-4 h-4 text-color-muted" /></button>
            </div>
          )}

          {/* Footer Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-color-surface border-t border-black/5 flex items-center gap-2 shrink-0 z-10">
            <input 
              type="text" 
              placeholder="Type a message (Double tap to react)..." 
              value={newMsgContent}
              onChange={(e) => setNewMsgContent(e.target.value)}
              className="flex-1 neu-inset px-4 py-2.5 rounded-xl bg-color-background text-xs text-color-text focus:outline-none" 
            />
            <Button type="submit" className="rounded-xl w-10 h-10 p-0 flex items-center justify-center bg-color-accent text-white border-none shadow-sm" disabled={!newMsgContent.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col items-center justify-center p-10 text-center text-color-muted bg-color-surface/40 neu-raised">
          <Send className="w-16 h-16 mb-4 opacity-20 text-color-accent" />
          <h4 className="font-bold text-lg font-serif">Inbox</h4>
          <p className="text-sm opacity-70 mt-1 max-w-sm">Please select a contact from the inbox list or open the user directory to start a new personal conversation.</p>
        </Card>
      )}
      
    </div>
  );
}
