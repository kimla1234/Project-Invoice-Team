"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Account from "./Account/Account";
import Company from "./Conpany/Company";
import { useState } from "react";
import { FullFormData } from "@/types/formData";

export function Settings() {
  
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="account" className=" space-y-4 w-full">
        <TabsList className="space-x-1 w-full rounded-md bg-slate-200  py-2">
          <TabsTrigger value="account" className="w-full">Account</TabsTrigger>
          <TabsTrigger value="company" className="w-full">Company</TabsTrigger>
          <TabsTrigger value="invoice" className="w-full">Invoice</TabsTrigger>
          <TabsTrigger value="security" className="w-full">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-auto w-full  rounded-md bg-white p-7 text-slate-600">
            <Account/>
          </div>
        </TabsContent>
        <TabsContent value="company" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-auto w-full rounded-md bg-white p-7 text-slate-600">
            <Company 
              />
          </div>
        </TabsContent>
        <TabsContent value="invoice" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-auto w-full rounded-md bg-white p-7 text-slate-600">
            invoice
          </div>
        </TabsContent>
        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-auto w-full rounded-md bg-white p-7 text-slate-600">
            Security
          </div>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
