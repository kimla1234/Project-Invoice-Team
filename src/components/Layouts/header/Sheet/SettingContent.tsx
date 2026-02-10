import React, { useState, ReactNode } from "react";
import {
  Bell,
  ChevronRight,
  Globe,
  LogOut,
  Settings,
  ShieldCheck,
  CreditCard,
  Palette,
  ArrowLeft,
  Moon,
  CheckCircle2,
} from "lucide-react";

interface SettingItemProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  color: string;
  value?: string;
  isLast?: boolean;
}

export default function SettingContent() {
  const [notifications, setNotifications] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="mx-auto  min-h-screen max-w-md font-sans text-slate-900 selection:bg-indigo-100">
      <div className=" flex h-full  flex-col ">
        <div className=" space-y-7">
          {/* User Profile Section - iOS Style */}
          <div className="flex items-center gap-4 rounded-2xl hover:bg-purple-50 cursor-pointer border-gray-100 bg-white p-5">
            <div className="relative">
              <div className="h-16 w-16 rounded-[22px] bg-gradient-to-tr from-indigo-500 to-purple-500 p-[3px]">
                <div className="h-full w-full rounded-[19px] bg-white p-0.5">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
                    alt="Profile"
                    className="h-full w-full rounded-[17px] object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow-sm">
                <CheckCircle2
                  size={16}
                  className="fill-blue-50 text-blue-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold leading-tight text-slate-900">
                Chhoeurn Kimla
              </h2>
              <p className="text-sm font-medium text-slate-500">
                chhoeurnkimla@gmail.com
              </p>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </div>

          {/* Account Settings Group */}
          <div className="space-y-2">
            <p className="mb-3 ml-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Account & Security
            </p>
            <div className="overflow-hidden rounded-2xl  border-gray-100 bg-white ">
              <SettingItem
                icon={<ShieldCheck size={20} />}
                title="Privacy"
                subtitle="Change Passcode"
                color="text-blue-600 bg-blue-50"
              />
              <SettingItem
                icon={<CreditCard size={20} />}
                title="Subscription"
                subtitle="Manage your plan"
                color="text-emerald-600 bg-emerald-50"
                value="Pro"
              />

              {/* Toggle Switch Item */}
              <div className="flex items-center justify-between bg-white p-4 transition-colors active:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-slate-800">
                      Notifications
                    </p>
                    <p className="text-[12px] font-medium text-slate-400">On</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`flex h-6 w-11 items-center rounded-full px-1 transition-all duration-300 ${
                    notifications ? "bg-green-500" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      notifications ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Group */}
          <div className="space-y-2">
            <p className="mb-3 ml-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Preferences
            </p>
            <div className="overflow-hidden  rounded-[24px]  border-gray-50 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
              <SettingItem
                icon={<Globe size={20} />}
                title="Language"
                subtitle="System default"
                color="text-indigo-600 bg-indigo-50"
                value="English"

              />

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between bg-white p-4 transition-colors active:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Moon size={18} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-slate-800">
                      Dark Mode
                    </p>
                    <p className="text-[12px] font-medium text-slate-400">
                      Automatic
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`flex h-6 w-11 items-center rounded-full px-1 transition-all duration-300 ${
                    isDarkMode ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      isDarkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <SettingItem
                icon={<Palette size={20} />}
                title="Theme"
                subtitle="Customize colors"
                color="text-rose-600 bg-rose-50"
                isLast={true}
              />
            </div>
          </div>
        </div>
        

        {/* Danger Zone */}
        <div className="border-t mt-28 bg-white p-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-50 bg-white p-4 text-sm font-bold text-red-500 transition-all active:scale-[0.98] active:bg-red-50">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingItem({
  icon,
  title,
  subtitle,
  color,
  value,
  isLast,
}: SettingItemProps) {
  return (
    <div
      className={`relative ${!isLast ? '  after:absolute after:bottom-0 after:left-16 after:right-4 after:h-[0.5px] after:bg-gray-100 after:content-[""]' : ""}`}
    >
      <button className="flex w-full items-center justify-between  bg-white p-4 text-left transition-colors active:bg-slate-50">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} shadow-sm`}
          >
            {icon}
          </div>
          <div>
            <p className="text-[15px] font-semibold leading-tight text-slate-800">
              {title}
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {value && (
            <span className="mr-1 text-sm text-slate-400">{value}</span>
          )}
          <ChevronRight size={16} className="text-slate-300" />
        </div>
      </button>
    </div>
  );
}
