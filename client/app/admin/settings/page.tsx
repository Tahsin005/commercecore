"use client";

import { useState } from "react";
import {
  Settings,
  RefreshCw,
  Truck,
  Megaphone,
  PhoneCall,
  FileText,
  ListOrdered,
  Cloud,
  ChevronDown,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { SiteSettingsTab } from "./components/SiteSettingsTab";
import { BannersTab } from "./components/BannersTab";
import { ContactChannelsTab } from "./components/ContactChannelsTab";
import { ContentBlocksTab } from "./components/ContentBlocksTab";
import { ProductBulletsTab } from "./components/ProductBulletsTab";
import { MediaUploadsTab } from "./components/MediaUploadsTab";

type ActiveTab =
  | "site_settings"
  | "banners"
  | "contact_channels"
  | "content_blocks"
  | "info_bullets"
  | "media_uploads";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("site_settings");
  const queryClient = useQueryClient();

  const handleRefreshAll = () => {
    queryClient.invalidateQueries();
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "site_settings", label: "Site Settings & Rates", icon: Truck },
    { id: "banners", label: "Homepage Banners", icon: Megaphone },
    { id: "contact_channels", label: "Contact Channels", icon: PhoneCall },
    { id: "content_blocks", label: "Content Pages", icon: FileText },
    { id: "info_bullets", label: "Product Bullets", icon: ListOrdered },
    { id: "media_uploads", label: "Media Upload Endpoints", icon: Cloud },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-maroon-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-maroon-800">
            <Settings className="w-6 h-6 text-maroon-700" />
            <h1 className="font-serif font-bold text-2xl text-maroon-900 tracking-tight">
              Admin Settings &amp; CMS Content
            </h1>
          </div>
          <p className="text-xs text-maroon-700 mt-1">
            Manage global site configurations, delivery rates, homepage sliders, contact channels, and static content.
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          className="px-4 py-2.5 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh All</span>
        </button>
      </div>

      <div className="sm:hidden">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as ActiveTab)}
            className="w-full pl-10 pr-10 py-3 bg-white text-maroon-900 font-bold text-xs border border-maroon-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-maroon-700 appearance-none cursor-pointer"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-700">
            {activeTab === "site_settings" && <Truck className="w-4 h-4" />}
            {activeTab === "banners" && <Megaphone className="w-4 h-4" />}
            {activeTab === "contact_channels" && <PhoneCall className="w-4 h-4" />}
            {activeTab === "content_blocks" && <FileText className="w-4 h-4" />}
            {activeTab === "info_bullets" && <ListOrdered className="w-4 h-4" />}
            {activeTab === "media_uploads" && <Cloud className="w-4 h-4" />}
          </div>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-maroon-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 p-1.5 bg-maroon-50/80 rounded-2xl border border-maroon-100/90 shadow-inner overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? "bg-maroon-900 text-white shadow-md"
                  : "text-maroon-800 hover:text-maroon-950 hover:bg-white/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cream" : "text-maroon-700"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "site_settings" && <SiteSettingsTab />}
      {activeTab === "banners" && <BannersTab />}
      {activeTab === "contact_channels" && <ContactChannelsTab />}
      {activeTab === "content_blocks" && <ContentBlocksTab />}
      {activeTab === "info_bullets" && <ProductBulletsTab />}
      {activeTab === "media_uploads" && <MediaUploadsTab />}
    </div>
  );
}
