import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Send, Search, Users } from 'lucide-react';
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
}

export function Messages() {
  const location = useLocation();
  const { token, user } = useAuth();
  
  const targetUserFromState = location.state?.targetUser as User | undefined;

  const [activeContacts, setActiveContacts] = useState<User[]>([]);
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // User directory logic to search new people
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDirectory, setShowDirectory] = useState(false);
  
  const [newMsgContent, setNewMsgContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContactsAndDirectory();
  }, [token]);

  // Load chat history whenever selected contact changes
  useEffect(() => {
    if (selectedContact) {
      fetchChatHistory();
    }
  }, [selectedContact, token]);

  // Scroll to bottom on new messages
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

        if (targetUserFromState) {
          setSelectedContact(targetUserFromState);
        } else if (mockUsers.length > 0) {
          setSelectedContact(mockUsers[0]);
        }
        return;
      }

      // Fetch active contacts
      const contactsRes = await fetch('http://localhost:8080/api/messages/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contactsData: User[] = await contactsRes.json();
      setActiveContacts(contactsData);

      // Fetch all system users (excluding current user)
      const usersRes = await fetch('http://localhost:8080/api/messages/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData: User[] = await usersRes.json();
      setAllUsers(usersData);

      // Pre-select target user if navigated from submissions/quizzes
      if (targetUserFromState) {
        setSelectedContact(targetUserFromState);
        
        // If not already in contacts, prepend temporarily
        const exists = contactsData.some(c => c.id === targetUserFromState.id);
        if (!exists) {
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
        // Fallback mock messaging
        setMessages([
          { 
            id: 1, 
            sender: selectedContact, 
            receiver: user as User, 
            content: 'Hello! I completed the practice quiz. Can we discuss the feedback?', 
            timestamp: new Date(Date.now() - 3600000).toISOString() 
          },
          { 
            id: 2, 
            sender: user as User, 
            receiver: selectedContact, 
            content: 'Sure! Let\'s go through your answers. You did great on kinematics questions.', 
            timestamp: new Date().toISOString() 
          }
        ]);
        return;
      }

      const response = await fetch(`http://localhost:8080/api/messages/history/${selectedContact.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
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
        content: newMsgContent
      };

      if (!token || token === 'mock-jwt-token') {
        const mockNew: Message = {
          id: messages.length + 1,
          sender: user as User,
          receiver: selectedContact,
          content: newMsgContent,
          timestamp: new Date().toISOString()
        };
        setMessages([...messages, mockNew]);
        setNewMsgContent('');
        return;
      }

      const response = await fetch('http://localhost:8080/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setNewMsgContent('');
        fetchChatHistory();
        
        // Refresh contact list to bubble contact to top if needed
        const contactsRes = await fetch('http://localhost:8080/api/messages/contacts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const contactsData = await contactsRes.json();
        setActiveContacts(contactsData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startNewChat = (target: User) => {
    setSelectedContact(target);
    setShowDirectory(false);
    
    // Add to contacts if missing
    const exists = activeContacts.some(c => c.id === target.id);
    if (!exists) {
      setActiveContacts([target, ...activeContacts]);
    }
  };

  // Filter contacts/users based on search
  const filteredContacts = activeContacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDirectory = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in pb-20 max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
      
      {/* Contact Panel */}
      <Card className="w-full lg:w-80 p-0 flex flex-col overflow-hidden shrink-0 border border-white/50 bg-color-surface/90 neu-raised">
        <div className="p-4 border-b border-black/5 bg-color-surface/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-color-text font-serif">Inbox</h3>
            <Button 
              size="sm" 
              variant="secondary" 
              className={`p-1.5 rounded-xl border-none ${showDirectory ? 'bg-color-accent text-white' : 'bg-color-accent/15 text-color-accent hover:bg-color-accent/20 text-black'}`}
              onClick={() => setShowDirectory(!showDirectory)}
              title="Search Directory"
            >
              <Users className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-color-muted" />
            <input 
              type="text" 
              placeholder={showDirectory ? "Search directory..." : "Search messages..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 neu-inset bg-color-background rounded-xl text-xs focus:outline-none" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showDirectory ? (
            // Search user directory list
            <div className="p-2 space-y-1">
              <p className="text-[10px] font-bold text-color-muted uppercase pl-2 mb-2 tracking-wide">User Directory</p>
              {filteredDirectory.length === 0 ? (
                <p className="text-xs text-color-muted italic p-4">No users found.</p>
              ) : (
                filteredDirectory.map((usr) => (
                  <div 
                    key={usr.id} 
                    onClick={() => startNewChat(usr)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-black/[0.02] transition-colors"
                  >
                    <Avatar fallback={usr.name[0]} size="sm" />
                    <div>
                      <h4 className="text-xs font-bold text-color-text leading-tight">{usr.name}</h4>
                      <p className="text-[10px] text-color-muted font-medium mt-0.5">{usr.role.toLowerCase()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Active chats contact list
            filteredContacts.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedContact(chat)}
                className={`flex items-center gap-3 p-4 border-b border-black/5 cursor-pointer transition-colors hover:bg-black/[0.02] ${selectedContact?.id === chat.id ? 'bg-black/[0.03] neu-inset' : ''}`}
              >
                <Avatar fallback={chat.name[0]} size="md" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-color-text truncate leading-tight">{chat.name}</h4>
                  <p className="text-xs text-color-muted font-medium truncate mt-1">
                    {chat.role.toLowerCase()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Dynamic Chat Window */}
      {selectedContact ? (
        <Card className="flex-1 p-0 flex flex-col overflow-hidden border border-white/50 bg-color-surface/90 neu-raised">
          {/* Active Header */}
          <div className="p-4 border-b border-black/5 bg-color-surface/50 flex items-center gap-3">
            <Avatar fallback={selectedContact.name[0]} size="sm" />
            <div>
              <h3 className="font-bold text-color-text font-serif leading-tight">{selectedContact.name}</h3>
              <p className="text-[10px] text-color-muted font-semibold mt-0.5">{selectedContact.role.toLowerCase()}</p>
            </div>
          </div>
          
          {/* Chat Bubble Stream */}
          <div className="flex-1 overflow-y-auto p-6 bg-color-background flex flex-col gap-4">
            {messages.length === 0 ? (
              <p className="text-xs text-color-muted italic text-center mt-20">Send a message to start personal conversation.</p>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender.email === user?.email || msg.sender.id === 999;
                return (
                  <div 
                    key={msg.id} 
                    className={`max-w-[75%] ${isMine ? 'self-end flex flex-col items-end' : 'self-start'}`}
                  >
                    <div className={`p-3 rounded-2xl text-xs font-semibold ${isMine ? 'rounded-tr-sm bg-color-accent text-white shadow-sm' : 'rounded-tl-sm bg-color-surface text-color-text border border-black/5 neu-raised'}`}>
                      {msg.content}
                    </div>
                    <span className="text-[8px] text-color-muted mt-1 px-1 font-bold">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-color-surface border-t border-black/5 flex items-center gap-2 shrink-0">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={newMsgContent}
              onChange={(e) => setNewMsgContent(e.target.value)}
              className="flex-1 neu-inset px-4 py-2.5 rounded-xl bg-color-background text-xs text-color-text focus:outline-none focus:ring-2 focus:ring-accent" 
            />
            <Button type="submit" className="rounded-xl w-10 h-10 p-0 flex items-center justify-center shrink-0 shadow-sm" disabled={!newMsgContent.trim()}>
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
