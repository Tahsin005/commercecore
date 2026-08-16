"use client";

import { useSiteSettingsQuery } from "@/hooks/useSettingsQueries";

export function MarqueeBanner() {
  const { data: settings } = useSiteSettingsQuery();
  const marquee = settings?.marquee;

  if (!marquee || !marquee.isActive || !marquee.text?.trim()) {
    return null;
  }

  const contentBlock = (
    <div className="flex items-center space-x-12 shrink-0 pr-12">
      <span className="inline-flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
        <span>{marquee.text}</span>
      </span>
      <span className="inline-flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-300/80 shrink-0" />
        <span>{marquee.text}</span>
      </span>
      <span className="inline-flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-300/80 shrink-0" />
        <span>{marquee.text}</span>
      </span>
    </div>
  );

  return (
    <div className="bg-maroon-950 text-amber-300 py-1.5 text-xs font-semibold overflow-hidden border-b border-maroon-800 select-none">
      <div className="animate-marquee flex items-center">
        {contentBlock}
        {contentBlock}
      </div>
    </div>
  );
}
