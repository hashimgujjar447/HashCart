'use client';

import React from 'react';
import { Tag, ShieldCheck } from 'lucide-react';

const NotificationsTab = () => {
  const sampleNotifications = [
    {
      id: 1,
      title: 'Welcome to HashCart!',
      message: 'Thank you for creating an account with HashCart. Enjoy exclusive shopping perks.',
      time: 'Just now',
      icon: ShieldCheck,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 2,
      title: 'Special Weekend Offers!',
      message: 'Check out today’s discounted deals with up to 50% off across departments.',
      time: '2 hours ago',
      icon: Tag,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div>
      <div className="pb-5 border-b border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Notifications
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Stay up-to-date with order alerts, promotions, and account notifications.
        </p>
      </div>

      <div className="space-y-3">
        {sampleNotifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className="p-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-all flex items-start gap-3.5"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                <Icon size={17} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-xs font-bold text-gray-900">{n.title}</h4>
                  <span className="text-[11px] text-gray-400">{n.time}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsTab;
