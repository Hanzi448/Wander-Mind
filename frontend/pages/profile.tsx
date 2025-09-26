import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Lock,
  Shield,
  Bell,
  Globe,
  Trash2,
  LogOut,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useAuthStore } from '@/services/auth';
import { Profile } from '@/utils/types';
import { SUCCESS_MESSAGES } from '@/utils/constants';
import { clsx } from 'clsx';

// Validation schema for profile updates
const profileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'account'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const router = useRouter();
  const { user, profile, updateProfile, logout } = useAuthStore();

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: profile?.bio || '',
      phone: profile?.phone || '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleProfileUpdate = async (data: ProfileFormData) => {
    try {
      setIsUpdatingProfile(true);
      await updateProfile(data);
      toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED);
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    try {
      setIsChangingPassword(true);
      // This would call your password change API
      // await authService.changePassword(data);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      // This would upload to Cloudinary or your storage service
      // const uploadedUrl = await uploadService.uploadAvatar(file);
      // await updateProfile({ avatar: uploadedUrl });
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update avatar');
    }
  };

  const handleAccountDeletion = async () => {
    try {
      // This would call your account deletion API
      // await authService.deleteAccount();
      toast.success('Account deleted successfully');
      logout();
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'account', label: 'Account', icon: Lock },
  ];

  return (
    <Layout
      title="Profile Settings - WanderMind"
      description="Manage your profile, security settings, and preferences."
      requireAuth={true}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={clsx(
                          'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left font-medium transition-colors',
                          activeTab === tab.id
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    <Button
                      variant="outline"
                      icon={isEditing ? X : Edit3}
                      onClick={() => {
                        setIsEditing(!isEditing);
                        if (!isEditing) {
                          profileForm.reset({
                            bio: profile?.bio || '',
                            phone: profile?.phone || '',
                          });
                        }
                      }}
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>

                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                      {profile?.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={user?.username}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-travel-500 flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">
                            {user?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 text-white cursor-pointer hover:bg-primary-700 transition-colors">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{user?.username}</h3>
                      <p className="text-gray-600">{user?.email}</p>
                      {profile?.bio && !isEditing && (
                        <p className="text-gray-500 mt-1">{profile.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Username"
                        value={user?.username || ''}
                        disabled={true}
                        icon={User}
                        helperText="Username cannot be changed"
                      />
                      
                      <Input
                        label="Email"
                        value={user?.email || ''}
                        disabled={true}
                        icon={Mail}
                        helperText="Email cannot be changed"
                      />
                    </div>

                    <Input
                      {...profileForm.register('phone')}
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      icon={Phone}
                      disabled={!isEditing}
                      error={profileForm.formState.errors.phone?.message}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        {...profileForm.register('bio')}
                        rows={4}
                        className={clsx(
                          'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                          !isEditing && 'bg-gray-50 cursor-not-allowed'
                        )}
                        placeholder="Tell us about yourself..."
                        disabled={!isEditing}
                      />
                      {profileForm.formState.errors.bio && (
                        <p className="text-sm text-red-600 mt-1">
                          {profileForm.formState.errors.bio.message}
                        </p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex items-center justify-end space-x-3">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setIsEditing(false);
                            profileForm.reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          loading={isUpdatingProfile}
                          icon={Save}
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Password</h3>
                          <p className="text-sm text-gray-600">Change your account password</p>
                        </div>
                        <Button
                          variant="outline"
                          icon={Lock}
                          onClick={() => setShowPasswordModal(true)}
                        >
                          Change Password
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-600">Add extra security to your account</p>
                        </div>
                        <Button variant="outline" disabled>
                          Coming Soon
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Login Sessions</h3>
                          <p className="text-sm text-gray-600">Manage your active sessions</p>
                        </div>
                        <Button variant="outline" disabled>
                          View Sessions
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Email notifications for trip updates</span>
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Weather alerts for upcoming trips</span>
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Marketing emails and travel tips</span>
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Display</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Currency</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option>USD - US Dollar</option>
                            <option>EUR - Euro</option>
                            <option>GBP - British Pound</option>
                            <option>PKR - Pakistani Rupee</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Time Zone</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option>UTC+05:00 - Pakistan Time</option>
                            <option>UTC+00:00 - GMT</option>
                            <option>UTC-05:00 - Eastern Time</option>
                            <option>UTC-08:00 - Pacific Time</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button variant="primary" icon={Save}>
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Actions</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Export Data</h3>
                          <p className="text-sm text-gray-600">Download all your travel data</p>
                        </div>
                        <Button variant="outline" disabled>
                          Export Data
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <h3 className="font-medium text-yellow-800">Sign Out</h3>
                          <p className="text-sm text-yellow-600">Sign out from this device</p>
                        </div>
                        <Button
                          variant="outline"
                          icon={LogOut}
                          onClick={() => {
                            logout();
                            router.push('/');
                          }}
                          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        >
                          Sign Out
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <h3 className="font-medium text-red-800">Delete Account</h3>
                          <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                        </div>
                        <Button
                          variant="danger"
                          icon={Trash2}
                          onClick={() => setShowDeleteModal(true)}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
          <Input
            {...passwordForm.register('currentPassword')}
            type="password"
            label="Current Password"
            placeholder="Enter your current password"
            error={passwordForm.formState.errors.currentPassword?.message}
          />
          
          <Input
            {...passwordForm.register('newPassword')}
            type="password"
            label="New Password"
            placeholder="Enter your new password"
            error={passwordForm.formState.errors.newPassword?.message}
          />
          
          <Input
            {...passwordForm.register('confirmPassword')}
            type="password"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            error={passwordForm.formState.errors.confirmPassword?.message}
          />

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isChangingPassword}
            >
              Change Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Account Deletion Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2">Are you absolutely sure?</h3>
            <p className="text-sm text-red-700">
              This action cannot be undone. This will permanently delete your account and remove all your data including trips, favorites, and profile information.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Please type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Type DELETE to confirm"
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleAccountDeletion}
              disabled={true} // Enable when input matches "DELETE"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default ProfilePage;