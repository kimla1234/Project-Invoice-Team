"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

/* =======================
   Types
======================= */
export type CompanyType = "products" | "service" | "recurring" | "education";

export interface CompanyDetailsData {
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyType?: CompanyType;
  companyLogo?: string | null;
}

interface CompanyDetailsStepProps {
  updateFormData: (data: Partial<CompanyDetailsData>) => void;
  data: CompanyDetailsData;
}

export interface CompanyDetailsStepHandle {
  validateAndSave: () => Promise<boolean>;
}

/* =======================
   Constants
======================= */
const COMPANY_TYPES = [
  { label: "Products", value: "products" },
  { label: "Service", value: "service" },
  { label: "Recurring", value: "recurring" },
  { label: "Education", value: "education" },
] as const;

/* =======================
   Component
======================= */
const CompanyStep = forwardRef<
  CompanyDetailsStepHandle,
  CompanyDetailsStepProps
>(({ updateFormData, data }, ref) => {
  /* =======================
     Validation Schema
  ======================= */
  const validationSchema = Yup.object({
    companyName: Yup.string().required("Company name is required"),
    companyEmail: Yup.string()
      .email("Invalid email")
      .required("Company email is required"),
    companyPhone: Yup.string()
      .matches(/^[0-9]+$/, "Invalid phone format")
      .required("Company phone is required"),
    companyType: Yup.mixed<CompanyType>()
      .oneOf(["products", "service", "recurring", "education"])
      .required("Company type is required"),
  });

  /* =======================
     Formik (STRONGLY TYPED)
  ======================= */
  const formik = useFormik<CompanyDetailsData>({
    initialValues: {
      companyName: data.companyName || "",
      companyEmail: data.companyEmail || "",
      companyPhone: data.companyPhone || "",
      companyAddress: data.companyAddress || "",
      companyType: data.companyType,
      companyLogo: data.companyLogo || null,
    },
    validationSchema,
    onSubmit: (values) => {
      updateFormData(values); // ✅ no TS error
    },
  });

  /* =======================
     Expose validation to parent
  ======================= */
  useImperativeHandle(ref, () => ({
    validateAndSave: async () => {
      formik.setTouched({
        companyName: true,
        companyEmail: true,
        companyPhone: true,
        companyAddress: true,
        companyType: true,
      });

      const errors = await formik.validateForm();
      console.log("Validation errors:", errors); // ✅ Debug here
      if (Object.keys(errors).length === 0) {
        updateFormData(formik.values);
        return true;
      }
      return false;
    },
  }));

  /* =======================
     Helpers
  ======================= */
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      formik.setFieldValue("companyLogo", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getInputClasses = (field: keyof CompanyDetailsData) => {
    const base =
      "w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition";
    return formik.touched[field] && formik.errors[field]
      ? `${base} border-red-500`
      : `${base} border-gray-300`;
  };

  const ErrorMessage = ({ field }: { field: keyof CompanyDetailsData }) =>
    formik.touched[field] && formik.errors[field] ? (
      <div className="ml-1 mt-1 text-xs text-red-500">
        {formik.errors[field]}
      </div>
    ) : null;

  /* =======================
     JSX
  ======================= */
  return (
    <div className="space-y-8 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-xl font-semibold">Company Information</h2>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Company Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              {...formik.getFieldProps("companyName")}
              className={getInputClasses("companyName")}
              placeholder="ABC Co., Ltd"
            />
            <ErrorMessage field="companyName" />
          </div>

          {/* Company Email */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Company Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...formik.getFieldProps("companyEmail")}
              className={getInputClasses("companyEmail")}
              placeholder="info@company.com"
            />
            <ErrorMessage field="companyEmail" />
          </div>

          {/* Company Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Company Phone <span className="text-red-500">*</span>
            </label>
            <input
              {...formik.getFieldProps("companyPhone")}
              className={getInputClasses("companyPhone")}
              placeholder="012345678"
            />
            <ErrorMessage field="companyPhone" />
          </div>

          {/* Company Type Dropdown */}
          <div className="w-full">
            <label className="mb-1 block text-sm font-medium">
              Company Type <span className="text-red-500">*</span>
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    getInputClasses("companyType"),
                    "flex items-center justify-between",
                  )}
                >
                  <span className="capitalize">
                    {formik.values.companyType || "Select type"}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="h-auto w-[365px] p-2">
                {COMPANY_TYPES.map((item) => (
                  <DropdownMenuItem
                    key={item.value}
                    className="capitalize hover:bg-slate-100"
                    onSelect={() => {
                      formik.setFieldValue("companyType", item.value);
                      formik.setFieldTouched("companyType", true);
                    }}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ErrorMessage field="companyType" />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="flex items-center gap-6">
          <div className="flex h-32 w-32 items-center justify-center rounded-lg border bg-gray-50">
            {formik.values.companyLogo ? (
              <img
                src={formik.values.companyLogo}
                alt="Company Logo"
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <span className="text-sm text-gray-400">Logo</span>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">Optionally set logo</p>
            <label className="inline-flex cursor-pointer items-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Upload Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </label>
            <p className="text-xs text-gray-400">
              Logo should be a square image of at least 256px.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
});

CompanyStep.displayName = "CompanyStep";
export default CompanyStep;
