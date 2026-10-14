'use client';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

const DashboardPage = () => {
  const { handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form
      className="w-full mx-auto p-8 shadow-lg text-white"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit);
      }}
    >
      <h2 className="text-2xl py-2 font-semibold font-poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight className="mx-2 text-[#80Deea]" />
        <span className=" cursor-pointer">Create Product</span>
      </div>
    </form>
  );
};

export default DashboardPage;
