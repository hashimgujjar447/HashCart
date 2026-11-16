'use client';

import React from 'react';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface OrderTrackingStepperProps {
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export const TRACKING_STEPS = [
  {
    id: 'Pending',
    title: 'Order Placed',
    sublabel: 'Awaiting confirmation',
    icon: Package,
  },
  {
    id: 'Processing',
    title: 'Processing',
    sublabel: 'Packaging items',
    icon: Clock,
  },
  {
    id: 'Shipped',
    title: 'Shipped',
    sublabel: 'In transit to you',
    icon: Truck,
  },
  {
    id: 'Delivered',
    title: 'Delivered',
    sublabel: 'Fulfilled successfully',
    icon: CheckCircle2,
  },
];

export const getStepIndex = (status: string): number => {
  switch (status?.toLowerCase()) {
    case 'delivered':
    case 'completed':
      return 3;
    case 'shipped':
      return 2;
    case 'processing':
      return 1;
    case 'pending':
      return 0;
    default:
      return 0;
  }
};

const OrderTrackingStepper: React.FC<OrderTrackingStepperProps> = ({
  status,
  createdAt,
  updatedAt,
}) => {
  const isCancelled = status?.toLowerCase() === 'cancelled';
  const currentStep = getStepIndex(status);

  // If order is cancelled, show clear cancellation alert state
  if (isCancelled) {
    return (
      <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 sm:p-5 my-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <XCircle size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-red-900">
                Order Cancelled
              </h4>
              <span className="text-xs text-red-600 font-medium bg-red-100/60 px-2.5 py-0.5 rounded-full">
                {updatedAt
                  ? `Cancelled on ${new Date(updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}`
                  : 'Order voided'}
              </span>
            </div>
            <p className="text-xs text-red-700/90 mt-1">
              This order has been cancelled and cannot proceed further. Any deducted items have been returned to inventory.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentage for the animated blue progress bar (from 12% to 88% width = 76%)
  const fillPercentage = (currentStep / 3) * 76;

  return (
    <div className="bg-gray-50/70 border border-gray-200/90 rounded-xl p-4 sm:p-6 my-3">
      {/* Header status bar */}
      <div className="flex items-center justify-between gap-2 mb-6 pb-3 border-b border-gray-200/60 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Live Order Progress:
          </span>
          <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
            {TRACKING_STEPS[currentStep].title}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Placed:{' '}
          {createdAt
            ? new Date(createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Recently'}
        </span>
      </div>

      {/* Stepper track & nodes */}
      <div className="relative py-2">
        {/* Background gray baseline connecting node centers */}
        <div className="absolute top-5 sm:top-6 left-[12%] right-[12%] h-1 bg-gray-200 rounded-full z-0" />

        {/* Animated dynamic blue fill line that grows as order progresses */}
        <div
          className="absolute top-5 sm:top-6 left-[12%] h-1 bg-blue-600 rounded-full transition-all duration-700 ease-in-out z-0"
          style={{ width: `${fillPercentage}%` }}
        />

        {/* 4 Interactive Nodes */}
        <div className="relative z-10 flex items-start justify-between">
          {TRACKING_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center text-center w-24 sm:w-28 group"
              >
                {/* Node Circle */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600'
                      : isActive
                      ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100 scale-105'
                      : 'bg-white text-gray-400 border-2 border-gray-200 shadow-2xs'
                  }`}
                  title={`${step.title} - ${step.sublabel}`}
                >
                  {isCompleted ? (
                    <CheckCircle2
                      size={20}
                      className="stroke-[2.5] text-white"
                    />
                  ) : (
                    <Icon
                      size={18}
                      className={`sm:w-5 sm:h-5 ${
                        isActive
                          ? 'animate-pulse text-white'
                          : 'text-gray-400'
                      }`}
                    />
                  )}
                </div>

                {/* Node Title */}
                <span
                  className={`mt-2.5 text-xs font-bold leading-tight transition-colors ${
                    isCompleted || isActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>

                {/* Node Sublabel */}
                <span
                  className={`text-[11px] mt-0.5 hidden sm:block ${
                    isActive
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {step.sublabel}
                </span>

                {/* Status indicator pill */}
                {isActive && (
                  <span className="mt-1 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-wider">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live status narrative description */}
      <div className="mt-6 pt-4 border-t border-gray-200/60 bg-white/70 rounded-lg p-3 text-xs text-gray-600 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
          <span>
            {currentStep === 0 &&
              'Your order has been recorded. Waiting for the seller to accept and start processing.'}
            {currentStep === 1 &&
              'The seller has accepted your order and is currently packaging and preparing items for pickup.'}
            {currentStep === 2 &&
              'Your package has been dispatched with the logistics courier and is on its way to your delivery address.'}
            {currentStep === 3 &&
              'Package delivered! Thank you for shopping with us.'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingStepper;
