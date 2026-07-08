import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/user.service';
import { Card, Input, Button, Loading } from '../components/Common';
import { useState } from 'react';

export const ProfilePage: React.FC = () => {
  const { user, fetchUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
        setFormData(data);
      } catch (error) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      const updated = await userService.updateProfile(formData);
      setProfile(updated);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile');
    }
  };

  if (loading) return <Loading message="Loading profile..." />;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <h1 className="text-4xl font-bold mb-8">My Profile</h1>

          <div className="space-y-6">
            {editing ? (
              <>
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  disabled
                />
                <Input
                  label="Phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Bio"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
                <div className="flex gap-4">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="danger" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="text-lg font-semibold">
                    {profile.firstName} {profile.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="text-lg font-semibold">{profile.email}</p>
                </div>
                {profile.phone && (
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="text-lg font-semibold">{profile.phone}</p>
                  </div>
                )}
                {profile.bio && (
                  <div>
                    <p className="text-gray-600">Bio</p>
                    <p className="text-lg">{profile.bio}</p>
                  </div>
                )}
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
