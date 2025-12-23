"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

export interface AddressData {
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  street?: string;
  houseNo?: string;
}

export interface CompanyDetailsStepHandle {
  validateAndSave: () => Promise<boolean>;
}

interface CompanyDetailsStepProps {
  updateFormData: (data: Partial<AddressData>) => void;
  data: AddressData;
}

const CompanyDetailsStep = forwardRef<CompanyDetailsStepHandle, CompanyDetailsStepProps>(
  ({ updateFormData, data }, ref) => {
    const formik = useFormik<AddressData>({
      initialValues: {
        province: data.province || "",
        district: data.district || "",
        commune: data.commune || "",
        village: data.village || "",
        street: data.street || "",
        houseNo: data.houseNo || "",
      },
      validationSchema: Yup.object({
        province: Yup.string().required("Province is required"),
        district: Yup.string().required("District is required"),
        commune: Yup.string().required("Commune is required"),
        village: Yup.string().required("Village is required"),
      }),
      onSubmit: (values) => {
        updateFormData(values);
      },
    });

    useImperativeHandle(ref, () => ({
      validateAndSave: async () => {
        formik.setTouched({
          province: true,
          district: true,
          commune: true,
          village: true,
        });

        const errors = await formik.validateForm();
        if (Object.keys(errors).length === 0) {
          updateFormData(formik.values);
          return true;
        }
        return false;
      },
    }));

    // Helper to determine styling based on validation state
    const getInputClasses = (field: keyof AddressData) =>
      formik.touched[field] && formik.errors[field]
        ? "w-full border border-red-500 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
        : "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500";

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-xl font-semibold">Company Address</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Province */}
          <div>
            <label className="block mb-1 font-medium">Province <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter province"
              className={getInputClasses("province")}
              {...formik.getFieldProps("province")}
            />
            {formik.touched.province && formik.errors.province && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.province}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block mb-1 font-medium">District <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter district"
              className={getInputClasses("district")}
              {...formik.getFieldProps("district")}
            />
            {formik.touched.district && formik.errors.district && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.district}</p>
            )}
          </div>

          {/* Commune */}
          <div>
            <label className="block mb-1 font-medium">Commune <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter commune"
              className={getInputClasses("commune")}
              {...formik.getFieldProps("commune")}
            />
            {formik.touched.commune && formik.errors.commune && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.commune}</p>
            )}
          </div>

          {/* Village */}
          <div>
            <label className="block mb-1 font-medium">Village <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter village"
              className={getInputClasses("village")}
              {...formik.getFieldProps("village")}
            />
            {formik.touched.village && formik.errors.village && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.village}</p>
            )}
          </div>

          {/* Street (Optional) */}
          <div>
            <label className="block mb-1 font-medium">Street (Optional)</label>
            <input
              type="text"
              placeholder="Enter street"
              className="w-full border border-gray-300 rounded px-3 py-2"
              {...formik.getFieldProps("street")}
            />
          </div>

          {/* House No. (Optional) */}
          <div>
            <label className="block mb-1 font-medium">House No. (Optional)</label>
            <input
              type="text"
              placeholder="Enter house number"
              className="w-full border border-gray-300 rounded px-3 py-2"
              {...formik.getFieldProps("houseNo")}
            />
          </div>
        </div>
      </div>
    );
  }
);

CompanyDetailsStep.displayName = "CompanyDetailsStep";
export default CompanyDetailsStep;