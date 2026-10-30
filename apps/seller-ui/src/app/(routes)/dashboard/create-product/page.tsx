'use client';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

const CreateProductForm = dynamic(
  () => import('@/app/shared/components/products/CreateProductForm'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[1600px] mx-auto py-8 text-white">
        <div className="h-8 w-48 bg-slate-800/60 rounded-lg animate-pulse mb-6" />
        <div className="h-96 w-full bg-slate-800/30 rounded-2xl animate-pulse" />
      </div>
    ),
  },
);

export default function CreateProductPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1600px] mx-auto py-8 text-white">
          <div className="h-8 w-48 bg-slate-800/60 rounded-lg animate-pulse mb-6" />
          <div className="h-96 w-full bg-slate-800/30 rounded-2xl animate-pulse" />
        </div>
      }
    >
      <CreateProductForm />
    </Suspense>
  );
}


