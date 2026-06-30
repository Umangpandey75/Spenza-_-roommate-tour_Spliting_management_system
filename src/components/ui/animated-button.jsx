'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export const AnimatedButton = ({ 
  onClick, 
  icon: Icon = Plus, 
  text = "New Group",
  className = "",
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center justify-start
        w-11 h-11 border-none rounded-full cursor-pointer
        overflow-hidden transition-all duration-300 ease-in-out
        shadow-lg hover:shadow-xl
        bg-blue-600 hover:bg-blue-700
        hover:w-32 hover:rounded-[40px]
        active:translate-x-0.5 active:translate-y-0.5
        ${className}
      `}
      {...props}
    >
      {/* Icon container */}
      <div className="
        flex items-center justify-center
        w-full transition-all duration-300 ease-in-out
        group-hover:w-[30%] group-hover:pl-5
      ">
        <Icon className="w-4 h-4 text-white" />
      </div>
      
      {/* Text */}
      <div className="
        absolute right-0 w-0 opacity-0
        text-white text-sm font-semibold
        transition-all duration-300 ease-in-out
        group-hover:opacity-100 group-hover:w-[70%] group-hover:pr-2.5
        whitespace-nowrap
      ">
        {text}
      </div>
    </button>
  );
};