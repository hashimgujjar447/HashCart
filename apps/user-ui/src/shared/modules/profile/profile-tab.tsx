'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Check } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import { useStore } from '@/store';

interface ProfileTabProps {
  user: any;
  refetchUser: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user, refetchUser }) => {
  const [name, setName] = useState<string>(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(
    user?.phone_number || '',
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phone_number || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await axiosInstance.put('/auth/update-profile', {
        name: name.trim(),
        phone_number: phoneNumber.trim(),
      });
      // Synchronously update Zustand state
      const updatedUser = res.data?.user || {
        ...user,
        name: name.trim(),
        phone_number: phoneNumber.trim(),
      };
      useStore.getState().setUser(updatedUser);

      setSuccessMsg('Profile updated successfully!');
      refetchUser();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setErrorMsg(
        err.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Profile
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Manage your personal details and account preferences.
        </p>
      </div>

      {successMsg && (
        <div className="mb-5 p-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Check size={14} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-colors cursor-pointer"
            title="Change photo"
          >
            <Camera size={13} />
          </button>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 text-base">{user?.name}</h3>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Customer Account
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus:border-blue-600 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded-lg px-3.5 py-2.5 cursor-not-allowed select-none"
          />
          <span className="text-[11px] text-gray-400 mt-1 block">
            Email address cannot be changed directly.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 234 567 890"
            className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus:border-blue-600 focus:outline-none transition-all"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
