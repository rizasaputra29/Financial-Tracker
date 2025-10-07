'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleSave = () => {
    if (!formData.fullName || !formData.email) {
      toast({
        title: 'Error',
        description: 'Name and email are required',
        variant: 'destructive',
      });
      return;
    }

    updateProfile({
      fullName: formData.fullName,
      email: formData.email,
      avatarUrl: formData.avatarUrl || undefined,
    });

    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
      });
    }
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center mb-4">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-center">{user.fullName}</h2>
                <p className="text-gray-600 text-center mt-1">{user.email}</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold">Account Information</CardTitle>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                    className="border-2 border-black disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="border-2 border-black disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    disabled={!isEditing}
                    className="border-2 border-black disabled:opacity-60"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold">About This App</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Financial Tracker</strong> is a Progressive Web App (PWA) designed to
                  help you manage your finances effectively.
                </p>
                <div className="pt-4">
                  <p className="font-semibold text-black mb-2">Features:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Track income and expenses</li>
                    <li>Set daily budget limits and monitor spending</li>
                    <li>Create multiple savings goals with progress tracking</li>
                    <li>View comprehensive financial dashboard</li>
                    <li>Works offline as a Progressive Web App</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
