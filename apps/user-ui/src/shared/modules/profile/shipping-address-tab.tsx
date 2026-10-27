'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, MapPin, Trash2, Edit3, CheckCircle2, ArrowRight } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import AddAddressModal from '@/shared/components/modals/add-address-modal';

export interface AddressType {
  id: string;
  userId: string;
  type: string;
  name: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

interface ShippingAddressTabProps {
  redirectUrl?: string | null;
  autoOpenAdd?: boolean;
}

const ShippingAddressTab: React.FC<ShippingAddressTabProps> = ({
  redirectUrl,
  autoOpenAdd = false,
}) => {
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/auth/get-addresses');
      const addrs = res.data.addresses || [];
      setAddresses(addrs);
      if (autoOpenAdd && addrs.length === 0) {
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load shipping addresses', err);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: AddressType) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await axiosInstance.delete(`/auth/delete-address/${id}`);
      fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address', err);
    }
  };

  const handleSetDefault = async (addr: AddressType) => {
    if (addr.isDefault) return;
    try {
      await axiosInstance.put(`/auth/update-address/${addr.id}`, {
        isDefault: true,
      });
      fetchAddresses();
    } catch (err) {
      console.error('Failed to set default address', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Shipping Address
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage your delivery addresses for quick checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>Add New Address</span>
        </button>
      </div>

      {redirectUrl && addresses.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <p className="text-xs font-semibold text-green-900">
              Address configured! You can now continue your order.
            </p>
          </div>
          <Link
            href={redirectUrl}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-5 border border-gray-200 rounded-xl bg-white animate-pulse space-y-3"
            >
              <div className="w-16 h-4 bg-gray-200 rounded" />
              <div className="w-2/3 h-4 bg-gray-200 rounded" />
              <div className="w-full h-3 bg-gray-200 rounded" />
              <div className="w-1/2 h-3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-xl border transition-all duration-200 relative flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-blue-600/60 bg-blue-50/20 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                      {addr.type || 'Home'}
                    </span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                        <CheckCircle2 size={11} />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  {addr.name}
                </h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>{addr.street}</p>
                  <p>
                    {addr.city}, {addr.zipCode}
                  </p>
                  <p className="font-medium text-gray-700">{addr.country}</p>
                </div>
              </div>

              {!addr.isDefault && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    Set as Default
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-xl bg-white">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <MapPin size={22} />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            No Shipping Address Found
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
            You have not added any shipping addresses yet. Add an address to speed
            up checkout.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Add Address
          </button>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <AddAddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAddresses}
        initialData={editingAddress}
      />
    </div>
  );
};

export default ShippingAddressTab;
