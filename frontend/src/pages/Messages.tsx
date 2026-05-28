import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Send, Search } from 'lucide-react';

const mockChats = [
  { id: 1, name: 'Sara Rahman', lastMsg: 'I did not understand question 2.', time: '10:42 AM', unread: true },
  { id: 2, name: 'Aarav Patel', lastMsg: 'Thanks sir!', time: 'Yesterday', unread: false },
];

export function Messages() {
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);

  return (
    <div className="animate-fade-in pb-20 max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
      
      {/* Chat List */}
      <Card className="w-full lg:w-80 p-0 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-black/5 bg-color-surface/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-color-muted" />
            <input type="text" placeholder="Search messages..." className="w-full pl-9 pr-4 py-2 neu-inset bg-color-background rounded-full text-sm focus:outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockChats.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center gap-3 p-4 border-b border-black/5 cursor-pointer transition-colors hover:bg-black/[0.02] ${selectedChat.id === chat.id ? 'bg-black/[0.03]' : ''}`}
            >
              <Avatar fallback={chat.name[0]} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className={`text-sm truncate ${chat.unread ? 'font-bold text-color-text' : 'font-medium text-color-muted'}`}>{chat.name}</h4>
                  <span className="text-xs text-color-muted shrink-0">{chat.time}</span>
                </div>
                <p className={`text-xs truncate ${chat.unread ? 'font-semibold text-color-text' : 'text-color-muted'}`}>{chat.lastMsg}</p>
              </div>
              {chat.unread && <div className="w-2 h-2 rounded-full bg-color-accent shrink-0"></div>}
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Window */}
      <Card className="flex-1 p-0 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-black/5 bg-color-surface/50 flex items-center gap-3">
          <Avatar fallback={selectedChat.name[0]} size="sm" />
          <h3 className="font-bold text-color-text font-serif">{selectedChat.name}</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-color-background flex flex-col gap-4">
          <div className="self-center text-xs text-color-muted my-2">Today</div>
          
          {/* Student Bubble (Cool color) */}
          <div className="self-start max-w-[70%]">
            <div className="p-3 rounded-2xl rounded-tl-sm neu-raised bg-color-surface text-sm text-color-text">
              I did not understand question 2 on the recent quiz. Can you explain?
            </div>
            <span className="text-[10px] text-color-muted mt-1 ml-1">10:42 AM</span>
          </div>

          {/* Teacher Bubble (Warm color / Accent) */}
          <div className="self-end max-w-[70%] flex flex-col items-end">
            <div className="p-3 rounded-2xl rounded-tr-sm shadow-md bg-color-accent text-white text-sm">
              Sure! Question 2 was about Newton's third law. Remember that forces always come in pairs.
            </div>
            <span className="text-[10px] text-color-muted mt-1 mr-1">10:45 AM</span>
          </div>
        </div>

        <div className="p-4 bg-color-surface border-t border-black/5 flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 neu-inset px-4 py-2.5 rounded-full bg-color-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" 
          />
          <Button className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
      
    </div>
  );
}
