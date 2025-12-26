"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Account from "./Account/Account";
import Company from "./Conpany/Company";
import Invoice from "./Invoice/Invoice";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import General from "./General/General";

export function Settings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "general";

  const [currentTab, setCurrentTab] = useState(tabParam);

  useEffect(() => {
    setCurrentTab(tabParam);
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    router.push(`/setting?tab=${value}`, { scroll: false });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs
        defaultValue="general"
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full space-y-4"
      >
        <TabsList className="w-full space-x-1 rounded-md bg-slate-200 py-2">
          <TabsTrigger value="general" className="w-full">
            General
          </TabsTrigger>
          <TabsTrigger value="account" className="w-full">
            Account
          </TabsTrigger>
          <TabsTrigger value="company" className="w-full">
            Company
          </TabsTrigger>
          <TabsTrigger value="invoice" className="w-full">
            Business
          </TabsTrigger>
          <TabsTrigger value="security" className="w-full">
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="general"
          className="duration-500 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="h-auto w-full rounded-md bg-white p-7 text-slate-600">
            <General />
          </div>
        </TabsContent>
        <TabsContent
          value="account"
          className="duration-500 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="h-auto w-full rounded-md bg-white p-7 text-slate-600">
            <Account />
          </div>
        </TabsContent>
        <TabsContent
          value="company"
          className="duration-500 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="h-auto w-full rounded-md bg-white p-7 text-slate-600">
            <Company />
          </div>
        </TabsContent>
        <TabsContent
          value="invoice"
          className="duration-500 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="h-auto w-full rounded-md bg-white p-7 text-slate-600">
            <Invoice />
          </div>
        </TabsContent>
        <TabsContent
          value="security"
          className="duration-500 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="h-auto w-full rounded-md bg-white p-7 text-slate-600">
            Security
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
