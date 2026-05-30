import { API_BASE_URL } from '../config';
import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

export function Profile() {
  const { role, user, token } = useAuth();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemovePicture = async () => {
    setFile(null);
    if (!avatarUrl && !user?.avatarUrl) return; 
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile/picture`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAvatarUrl('');
        setMessage({ type: 'success', text: 'Profile picture removed.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to remove picture.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // If passwords are provided, they must match
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (!token || token === 'mock-jwt-token') {
      setMessage({ type: 'success', text: 'Password updated successfully (Mock Mode).' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      return;
    }

    setLoading(true);
    let successMsg = '';
    let hasError = false;

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const picRes = await fetch(`${API_BASE_URL}/api/auth/profile/picture`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (picRes.ok) {
          const picData = await picRes.json();
          setAvatarUrl(picData.avatarUrl);
          successMsg += 'Profile picture updated! ';
          setFile(null);
        } else {
          hasError = true;
          setMessage({ type: 'error', text: 'Failed to upload picture.' });
        }
      }

      if (oldPassword && newPassword && !hasError) {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ oldPassword, newPassword })
        });

        if (res.ok) {
          successMsg += 'Password updated successfully!';
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          const errorText = await res.text();
          setMessage({ type: 'error', text: errorText || 'Failed to update password.' });
          hasError = true;
        }
      }

      if (successMsg && !hasError) {
        setMessage({ type: 'success', text: successMsg + ' Note: You may need to log back in to fully apply the picture globally.' });
      } else if (!file && !oldPassword && !newPassword) {
        setMessage({ type: 'error', text: 'Nothing to update.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-10 max-w-md mx-auto space-y-4 flex flex-col items-center mt-6">
      <Card className="w-full p-6 flex flex-col items-center text-center">
        <div className="relative mb-4 group cursor-pointer" onClick={() => document.getElementById('profile-upload')?.click()}>
          <Avatar 
            src={file ? URL.createObjectURL(file) : (avatarUrl || user?.avatarUrl)}
            fallback={user?.name ? user.name.charAt(0).toUpperCase() : (role === 'student' ? 'S' : 'R')} 
            size="lg" 
            className="w-20 h-20 text-xl bg-color-accent text-white border-4 border-color-surface transition-opacity group-hover:opacity-80" 
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[10px] bg-black/70 text-white font-bold px-2 py-1 rounded-md">Upload</span>
          </div>
        </div>
        
        <h1 className="text-xl font-bold font-serif">{user?.name || (role === 'student' ? 'Student' : 'Teacher')}</h1>
        <p className="text-color-muted mt-0.5 uppercase text-[10px] tracking-widest">{role}</p>
        
        <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4 text-left">
          <Input label="Email Address" value={user?.email || ''} readOnly className="opacity-70 cursor-not-allowed" />
          
          <div className="space-y-1">
            <label className="block text-xs font-bold text-color-muted uppercase">Profile Picture</label>
            <div className="flex items-center gap-2">
              <input 
                id="profile-upload"
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="w-full text-sm text-color-text file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-color-accent file:text-white hover:file:brightness-110 cursor-pointer" 
              />
              {(avatarUrl || user?.avatarUrl || file) && (
                <Button type="button" variant="secondary" onClick={handleRemovePicture} disabled={loading} className="shrink-0 text-xs py-2 px-3 border-color-danger text-color-danger hover:bg-color-danger/10">
                  Remove
                </Button>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-black/5 space-y-4">
            <h3 className="font-bold text-lg font-serif">Change Password</h3>
            
            {message && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${message.type === 'success' ? 'bg-color-success/15 text-color-success' : 'bg-color-danger/15 text-color-danger'}`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
            <Input label="Old Password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
