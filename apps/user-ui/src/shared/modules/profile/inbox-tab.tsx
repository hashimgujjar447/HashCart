'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

const InboxTab = () => {
  return (
    <div>
      <div className="pb-5 border-b border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Inbox
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Chat directly with vendors, stores, and customer support.
        </p>
      </div>

      <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-xl bg-white">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <MessageSquare size={22} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          No Conversations Yet
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          When you message a seller from their shop or product page, your conversations will appear here.
        </p>
      </div>
    </div>
  );
};

export default InboxTab;
