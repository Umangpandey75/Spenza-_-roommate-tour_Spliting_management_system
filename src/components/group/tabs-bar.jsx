"use client";

import React from "react";
import { TabsList, TabsTrigger } from "../ui/tabs";

export function TabsBar() {
  const tabs = [
    {
      value: "overview",
      label: "Overview",
      underlineColor: "data-[state=active]:after:bg-blue-500",
      textColor: "data-[state=active]:text-blue-600",
    },
    {
      value: "expenses",
      label: "Expenses",
      underlineColor: "data-[state=active]:after:bg-green-500",
      textColor: "data-[state=active]:text-green-600",
    },
    {
      value: "participants",
      label: "Participants",
      underlineColor: "data-[state=active]:after:bg-purple-500",
      textColor: "data-[state=active]:text-purple-600",
    },
    {
      value: "settle",
      label: "Settle",
      underlineColor: "data-[state=active]:after:bg-orange-500",
      textColor: "data-[state=active]:text-orange-600",
    },
    {
      value: "what-if",
      label: "What-If",
      underlineColor: "data-[state=active]:after:bg-pink-500",
      textColor: "data-[state=active]:text-pink-600",
    },
    {
      value: "settings",
      label: "Settings",
      underlineColor: "data-[state=active]:after:bg-gray-500",
      textColor: "data-[state=active]:text-gray-600",
    },
  ];

  return (
    <div className="flex justify-center mb-4 sm:mb-6">
      <TabsList className="inline-flex h-10 sm:h-12 items-end justify-center bg-transparent p-0 border-b border-gray-200 dark:border-gray-700 w-full sm:w-auto overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={`
              px-3 sm:px-6 py-2 sm:py-3 mx-0.5 sm:mx-1 relative bg-transparent border-0 rounded-none flex-shrink-0
              ${tab.textColor} ${tab.underlineColor}
              data-[state=active]:font-semibold data-[state=active]:shadow-none
              transition-all duration-300 ease-out
              hover:text-gray-700 dark:hover:text-gray-300
              text-gray-500 dark:text-gray-400
              text-xs sm:text-sm whitespace-nowrap
              after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 
              after:h-0.5 after:bg-transparent after:transition-all after:duration-300
              data-[state=active]:after:h-0.5 data-[state=active]:after:scale-x-100
              after:scale-x-0 after:origin-center
              min-w-0
            `}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
