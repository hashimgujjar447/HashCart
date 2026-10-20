'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Copy,
  Check,
  Loader2,
  Plus,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import Input from '@packages/components/input';
import DeleteModal from '@/app/shared/components/delete-modal';

interface DiscountCode {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<DiscountCode | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [publicName, setPublicName] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery<DiscountCode[]>({
    queryKey: ['shop-discount-codes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/product/get-discount-codes');
      return response.data?.discount_codes || [];
    },
  });

  const resetForm = () => {
    setPublicName('');
    setDiscountCode('');
    setDiscountType('Percentage');
    setDiscountValue('');
    setErrorMessage('');
  };

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data: {
      public_name: string;
      discountCode: string;
      discountType: string;
      discountValue: number;
    }) => {
      const response = await axiosInstance.post(
        '/product/create-discount-code',
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-discount-codes'] });
      resetForm();
      setShowModal(false);
    },
    onError: (err: any) => {
      setErrorMessage(
        err?.response?.data?.message || 'Failed to create discount code',
      );
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(
        `/product/delete-discount-code/${id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-discount-codes'] });
      setDeleteItem(null);
    },
  });

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (discountCodes.length >= 8) {
      setErrorMessage('You can only create up to 8 discount codes.');
      return;
    }

    if (!publicName.trim() || !discountCode.trim() || !discountValue) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    createDiscountCodeMutation.mutate({
      public_name: publicName.trim(),
      discountCode: discountCode.trim().toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
    });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    deleteDiscountCodeMutation.mutate(deleteItem.id);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full min-h-screen p-6 max-w-[1600px] mx-auto text-white font-poppins">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl text-white font-bold tracking-tight">
            Discount Codes
          </h2>
          <div className="flex items-center text-xs text-gray-400 gap-1.5 mt-1">
            <Link href="/dashboard" className="text-[#80deea] hover:underline">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-300">Discount Codes</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition cursor-pointer shadow-lg shadow-blue-600/20 w-fit"
        >
          <Plus size={18} />
          <span>Create Discount</span>
        </button>
      </div>

      {isLoading ? (
        <div className="w-full flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : discountCodes.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-20 px-4 border border-dashed border-[#242c3d] rounded-2xl bg-[#0c1017]">
          <div className="w-16 h-16 rounded-full bg-[#182334] border border-[#2b3a55] flex items-center justify-center text-blue-400 mb-4 shadow-inner">
            <Tag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            No discount codes yet
          </h3>
          <p className="text-sm text-gray-400 text-center max-w-sm mb-6">
            Create discount codes to attract more customers and boost your
            sales.
          </p>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Discount</span>
          </button>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-[#232b3b] bg-[#0e121a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#232b3b] bg-[#121722] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Discount Code</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Value</th>
                  <th className="py-4 px-6">Created At</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2533] text-sm">
                {discountCodes.map((item) => {
                  const isPercentage =
                    item.discountType?.toLowerCase() === 'percentage';
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#141a26] transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-white">
                        {item.public_name}
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-2 bg-[#182233] border border-[#27364f] px-2.5 py-1 rounded-md">
                          <span className="font-mono font-semibold text-blue-400 text-xs">
                            {item.discountCode}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(item.discountCode, item.id)
                            }
                            className="text-gray-400 hover:text-white transition cursor-pointer"
                            title="Copy code"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            isPercentage
                              ? 'bg-blue-950/60 border-blue-500/30 text-blue-300'
                              : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {item.discountType}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-200">
                        {isPercentage
                          ? `${item.discountValue}%`
                          : `$${item.discountValue}`}
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-xs">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteItem(item)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer"
                          title="Delete code"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f141d] border border-[#242c3d] p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#1f2838] mb-5">
              <h3 className="text-lg font-bold text-white">
                Create Discount Code
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c2433] flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <Input
                label="Public Name *"
                placeholder="e.g., Summer Special"
                value={publicName}
                onChange={(e: any) => setPublicName(e.target.value)}
                required
              />

              <Input
                label="Discount Code *"
                placeholder="e.g., SUMMER20"
                value={discountCode}
                onChange={(e: any) =>
                  setDiscountCode(e.target.value.toUpperCase())
                }
                required
              />

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-200">
                  Discount Type *
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="Percentage" className="bg-[#11141a]">
                    Percentage (%)
                  </option>
                  <option value="Flat" className="bg-[#11141a]">
                    Flat Amount ($)
                  </option>
                </select>
              </div>

              <Input
                label="Discount Value *"
                placeholder={
                  discountType === 'Percentage' ? 'e.g., 20' : 'e.g., 50'
                }
                type="number"
                value={discountValue}
                onChange={(e: any) => setDiscountValue(e.target.value)}
                required
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-[#2b3342] bg-[#141a24] hover:bg-[#1a2230] text-gray-300 text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDiscountCodeMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {createDiscountCodeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Create</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Discount Code"
        itemName={deleteItem?.public_name}
        isDeleting={deleteDiscountCodeMutation.isPending}
      />
    </div>
  );
};

export default Page;
