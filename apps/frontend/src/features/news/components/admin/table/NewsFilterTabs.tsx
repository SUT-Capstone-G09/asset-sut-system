import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count: number;
}

interface NewsFilterTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const NewsFilterTabs: React.FC<NewsFilterTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="w-full border-b border-gray-200">
      <div className="flex items-center gap-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 outline-none ${isActive
                  ? "text-[#EA580C]"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive
                    ? "bg-[#EA580C] text-white"
                    : "bg-gray-100 text-gray-600"
                  }`}
              >
                {tab.count}
              </span>

              {/* Active Tab Underline */}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#EA580C]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
