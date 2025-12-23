import { Settings } from "@/components/Settings/Settings";
import React from "react";

export default function page() {
  return (
    <div className="space-y-3">
      <div>
        <div className="justify-center rounded-lg text-2xl text-slate-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          Settings
        </div>
        <div>Manage your account preferences and configuration</div>
      </div>
      
     <Settings/>

    </div>
  );
}
