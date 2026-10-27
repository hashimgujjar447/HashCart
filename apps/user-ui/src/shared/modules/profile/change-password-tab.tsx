'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

const ChangePasswordTab = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setSuccessMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Failed to change password', err);
      setErrorMsg(
        err.response?.data?.message || 'Failed to change password. Please verify current password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Change Password
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Update your account password regularly to keep your account safe.
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

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-lg pl-3.5 pr-10 py-2.5 focus:border-blue-600 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-lg pl-3.5 pr-10 py-2.5 focus:border-blue-600 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus:border-blue-600 focus:outline-none transition-all"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? 'Changing...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordTab;
