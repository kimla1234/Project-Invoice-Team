"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { FullFormData } from "@/types/formData";
import { Building2, MapPin, CheckCircle2, Home, Hash, Briefcase } from "lucide-react";
import { User, Mail, Phone } from "lucide-react";
export interface DocumentsStepHandle {
  validateAndSave: () => Promise<boolean>;
}

interface DocumentsStepProps {
  data: FullFormData;
  updateFormData: (data: Partial<FullFormData>) => void;
}

const DocumentsStep = forwardRef<DocumentsStepHandle, DocumentsStepProps>(
  ({ data }, ref) => {
    useImperativeHandle(ref, () => ({
      validateAndSave: async () => {
        return true;
      },
    }));

    // Reusable Sub-component for data rows
    const InfoRow = ({
      label,
      value,
      icon: Icon,
    }: {
      label: string;
      value?: string;
      icon?: any;
    }) => (
      <div className="flex items-start gap-3 border-b border-gray-50 py-3 last:border-0">
        {Icon && <Icon className="text-muted-foreground mt-1 h-4 w-4" />}
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            {label}
          </span>
          <span className="text-foreground text-sm font-semibold">
            {value || "Not provided"}
          </span>
        </div>
      </div>
    );

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-4xl space-y-8 duration-500">
        {/* Top Status Bar */}

        <div className="flex justify-between space-y-2">
          <div>
            <h2 className="text-xl font-semibold">Review Your Details</h2>
            <p className="text-slate-500">
              Please double-check your information before final submission.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              All Steps Validated
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Information Card */}
          <div className="space-y-2 overflow-hidden rounded-xl border border-dashed p-4 transition">
            <div className="mb-4 text-center text-xl text-primary">
              Personal Infomation
            </div>
            <div className="space-y-4">
              {/* Full Name Row */}
              <div className="flex items-center gap-3 rounded-lg border-slate-200 bg-slate-50 p-3">
                <User className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="text-sm font-medium text-slate-800">
                  {data.fullName}
                </div>
              </div>

              {/* Email Row */}
              <div className="flex items-center gap-3 rounded-lg border-slate-200 bg-slate-50 p-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="text-sm font-medium text-slate-800">
                  {data.email}
                </div>
              </div>

              {/* Phone Number Row */}
              <div className="flex items-center gap-3 rounded-lg border-slate-200 bg-slate-50 p-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="text-sm font-medium text-slate-800">
                  {data.phoneNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Card */}
          <div className="space-y-2 overflow-hidden rounded-xl border border-dashed p-4 transition">
            <div className="mb-4 text-center text-xl text-primary">
              Company Details
            </div>

            <div className="space-y-4">
              {/* Company Name Row */}
              <div className="flex items-center gap-3 rounded-lg border-slate-200 bg-slate-50 p-3">
                <Building2 className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="text-sm font-medium text-slate-800">
                  {data.companyName}
                </div>
              </div>

              {/* Business Type Row */}
              <div className="flex items-center gap-3 rounded-lg border-slate-200 bg-slate-50 p-3">
                <Briefcase className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="text-sm font-medium text-slate-800">
                  {data.companyType}
                </div>
              </div>

              {/* Work Email Row */}
              <div className="flex items-center gap-3 rounded-lg border-slate-200 bg-slate-50 p-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="text-sm font-medium text-slate-800">
                  {data.companyEmail}
                </div>
              </div>

              {/* Work Phone Row */}
              <div className="flex items-center gap-3 rounded-lg border-slate-200 bg-slate-50 p-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="text-sm font-medium text-slate-800">
                  {data.companyPhone}
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Card - spans 2 columns */}
          {/* Address Information Card - spans 2 columns */}
          {/* This matches the exact visual style of your snippet */}
          <div className="overflow-hidden rounded-xl bg-slate-50 transition md:col-span-2">
            <div className="flex items-center gap-3 bg-blue-50 px-6 py-4">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">
                Registered Office Address (VATTIN)
              </h3>
            </div>
            <div className="p-6">
              {/* Using a 3 column grid for address details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <InfoRow
                  label="VATTIN / Address No."
                  value={data.houseNo || "0840"}
                  icon={Hash}
                />
                <InfoRow
                  label="Street No."
                  value={data.street || "08493"}
                  icon={Home}
                />
                <InfoRow
                  label="Phone Number"
                  value={data.phoneNumber || "08948364834"}
                  icon={Phone}
                />
                <InfoRow
                  label="Province / City"
                  value={data.province || "Kampong Cham"}
                />
                <InfoRow
                  label="Town / District"
                  value={data.district || "Chamkar Leu"}
                />
                <InfoRow
                  label="Commune / Sangkat"
                  value={data.commune || "Chamkar Andoung"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Footer */}
        <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="rounded-full bg-blue-600 p-1">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm leading-relaxed text-blue-800">
            By proceeding, you confirm that all the information provided above
            is accurate. You can still go back to previous steps to edit if
            needed.
          </p>
        </div>
      </div>
    );
  },
);

DocumentsStep.displayName = "DocumentsStep";
export default DocumentsStep;
