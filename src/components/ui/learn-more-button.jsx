'use client';

import React from 'react';

export const LearnMoreButton = ({ 
  onClick, 
  text = "Create Your First Group",
  className = "",
  ...props 
}) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔄 LearnMoreButton clicked');
        onClick?.(e);
      }}
      className={`
        relative inline-flex items-center gap-3
        px-6 py-3 rounded-full
        bg-slate-100 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600
        text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white
        font-medium text-sm
        border border-slate-200 dark:border-slate-700
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-105
        active:scale-95
        cursor-pointer outline-none
        whitespace-nowrap
        ${className}
      `}
      {...props}
    >
      {/* Arrow icon */}
      <svg 
        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" 
          fill="currentColor" 
        />
      </svg>
      
      {/* Button text */}
      <span className="font-semibold">
        {text}
      </span>
    </button>
  );
};