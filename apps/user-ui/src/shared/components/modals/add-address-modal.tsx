'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const COUNTRIES = [
  'Bangladesh',
  'Pakistan',
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'United Arab Emirates',
  'Saudi Arabia',
];

const AddAddressModal: React.FC<AddAddressModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [type, setType] = useState<string>('Home');
  const [name, setName] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  const [country, setCountry] = useState<string>('Bangladesh');
  const [isDefault, setIsDefault] = useState<string>('Not Default');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'Home');
      setName(initialData.name || '');
      setStreet(initialData.street || '');
      setCity(initialData.city || '');
      setZipCode(initialData.zipCode || '');
      setCountry(initialData.country || 'Bangladesh');
      setIsDefault(initialData.isDefault ? 'Default' : 'Not Default');
    } else {
      setType('Home');
      setName('');
      setStreet('');
      setCity('');
      setZipCode('');
      setCountry('Bangladesh');
      setIsDefault('Not Default');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !street.trim() || !city.trim() || !zipCode.trim() || !country.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      type,
      name: name.trim(),
      street: street.trim(),
      city: city.trim(),
      zipCode: zipCode.trim(),
      country,
      isDefault: isDefault === 'Default',
    };

    try {
      if (initialData?.id) {
        await axiosInstance.put(`/auth/update-address/${initialData.id}`, payload);
      } else {
        await axiosInstance.post('/auth/add-address', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save address', err);
      setError(
        err.response?.data?.message || 'Failed to save address. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-poppins">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-gray-900">
            {initialData?.id ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-3.5">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Address Type */}
          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus:border-blue-600 focus:outline-none transition-all"
            />
          </div>

          {/* Street */}
          <div>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street"
              className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus:border-blue-600 focus:outline-none transition-all"
            />
          </div>

          {/* City */}
          <div>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus:border-blue-600 focus:outline-none transition-all"
            />
          </div>

          {/* ZIP Code */}
          <div>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="ZIP Code"
              className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus:border-blue-600 focus:outline-none transition-all"
            />
          </div>

          {/* Country */}
          <div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Default Status */}
          <div>
            <select
              value={isDefault}
              onChange={(e) => setIsDefault(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 focus:border-blue-600 focus:outline-none transition-all cursor-pointer"
            >
              <option value="Not Default">Not Default</option>
              <option value="Default">Default</option>
            </select>
          </div>

          {/* Save Address Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddressModal;
