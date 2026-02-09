"use client";
import Account from "@/components/DashboardCompoenents/Settings/Account/Account";
import General from "@/components/DashboardCompoenents/Settings/General/General";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/DashboardCompoenents/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TicketCard } from "./TicketCard";

export function TicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "comming";
  const [currentTab, setCurrentTab] = useState(tabParam);

  useEffect(() => {
    setCurrentTab(tabParam);
  }, [tabParam]);
  
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    router.push(`/?tab=${value}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="general"
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full space-y-4"
      >
        <TabsList className="w-full space-x-1 rounded-md bg-slate-200 py-2">
          <TabsTrigger value="comming" className="w-full">
            Comming 
          </TabsTrigger>
          <TabsTrigger value="history" className="w-full">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="comming"
          className="duration-500 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="h-auto w-full space-y-4 rounded-md bg-white  text-slate-600">
            <TicketCard status="upcoming" />
            <TicketCard status="upcoming" />
          </div>
        </TabsContent>

        <TabsContent
          value="history"
          className="duration-500 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="h-auto w-full rounded-md bg-white  text-slate-600">
           <TicketCard status="upcoming" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
