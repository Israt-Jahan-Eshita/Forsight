import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { role } = useAuth();

  return (
    <div className="animate-fade-in pb-20 max-w-2xl mx-auto space-y-8 flex flex-col items-center">
      <Card className="w-full p-8 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <Avatar fallback={role === 'student' ? 'S' : 'R'} size="lg" className="w-24 h-24 text-2xl bg-color-accent text-white border-4 border-color-surface" />
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-color-surface neu-raised flex items-center justify-center text-xs">✏️</button>
        </div>
        
        <h1 className="text-2xl font-bold font-serif">{role === 'student' ? 'Sara Rahman' : 'Rahim Khan'}</h1>
        <p className="text-color-muted mt-1">{role === 'student' ? 'Class 10 - Science' : 'Science Department'}</p>
        
        <div className="w-full mt-8 space-y-6 text-left">
          <Input label="Email Address" value={role === 'student' ? 'sara@student.edu' : 'rahim@school.edu'} readOnly className="opacity-70 cursor-not-allowed" />
          
          <div className="pt-6 border-t border-black/5 space-y-6">
            <h3 className="font-bold text-lg font-serif">Change Password</h3>
            <Input label="Old Password" type="password" />
            <Input label="New Password" type="password" />
            <Input label="Confirm New Password" type="password" />
            <Button className="w-full">Save Changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
