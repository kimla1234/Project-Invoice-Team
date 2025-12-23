// components/BasicInfoStep.tsx
"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import React, { forwardRef, useImperativeHandle } from "react";

interface BasicInfoData {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
}

interface BasicInfoStepProps {
  updateFormData: (data: Partial<BasicInfoData>) => void;
  data: BasicInfoData;
}

// Define the shape of the ref handle the parent will use
export interface BasicInfoStepHandle {
  validateAndSave: () => Promise<boolean>;
}



const BasicInfoStep = forwardRef<BasicInfoStepHandle, BasicInfoStepProps>(
  ({ updateFormData, data }, ref) => {
    const validationSchema = Yup.object({
      fullName: Yup.string().required("Full name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirmation is required"),
      phoneNumber: Yup.string()
        .matches(/^[0-9]+$/, "Invalid phone format (e.g., 093882736)")
        .required("Phone number is required"),
    });

    const formik = useFormik({
      initialValues: {
        fullName: data.fullName || "",
        email: data.email || "",
        password: data.password || "",
        confirmPassword: data.confirmPassword || "",
        phoneNumber: data.phoneNumber || "",
      },
      validationSchema: validationSchema,
      onSubmit: (values) => {
        updateFormData(values); // Only update parent state upon successful validation/submission attempt
      },
    });

    // Expose a function to the parent component via the ref
    useImperativeHandle(ref, () => ({
      validateAndSave: async () => {
        // Mark all fields as touched (so errors show)
        formik.setTouched({
          fullName: true,
          email: true,
          password: true,
          confirmPassword: true,
          phoneNumber: true,
          
        });

        // Run validation
        const errors = await formik.validateForm();

        // If no errors → save data
        if (Object.keys(errors).length === 0) {
          updateFormData(formik.values);
          return true;
        }

        return false;
      },
    }));

    const getInputClasses = (fieldName: keyof BasicInfoData) => {
      const baseClasses =
        "w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";
      if (formik.touched[fieldName] && formik.errors[fieldName]) {
        return `${baseClasses} border-red-500`;
      }
      return `${baseClasses} border-gray-300`;
    };

    const ErrorMessage = ({
      fieldName,
    }: {
      fieldName: keyof BasicInfoData;
    }) => {
      if (formik.touched[fieldName] && formik.errors[fieldName]) {
        return (
          <div className="ml-1 mt-1 text-xs text-red-500">
            {formik.errors[fieldName]}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-xl font-semibold">Account Information</h2>
        <form onSubmit={formik.handleSubmit}>
          {/* ... (rest of the form fields using formik.getFieldProps as before) ... */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Full Name <span className="text-red">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                {...formik.getFieldProps("fullName")}
                placeholder="Enter your full name"
                className={getInputClasses("fullName")}
              />
              <ErrorMessage fieldName="fullName" />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email Address <span className="text-red">*</span>
              </label>
              <input
                type="email"
                id="email"
                {...formik.getFieldProps("email")}
                placeholder="Enter your email"
                className={getInputClasses("email")}
              />
              <ErrorMessage fieldName="email" />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Password <span className="text-red">*</span>
              </label>
              <input
                type="password"
                id="password"
                {...formik.getFieldProps("password")}
                placeholder="Create a password"
                className={getInputClasses("password")}
              />
              <ErrorMessage fieldName="password" />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm Password <span className="text-red">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...formik.getFieldProps("confirmPassword")}
                placeholder="Confirm your password"
                className={getInputClasses("confirmPassword")}
              />
              <ErrorMessage fieldName="confirmPassword" />
            </div>
          </div>
          {/* Phone Number Field (Full width) */}
          <div className="mt-6">
            <label
              htmlFor="phoneNumber"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              {...formik.getFieldProps("phoneNumber")}
              placeholder="093882736"
              className={getInputClasses("phoneNumber")}
            />
            <ErrorMessage fieldName="phoneNumber" />
          </div>
        </form>
      </div>
    );
  },
);

BasicInfoStep.displayName = "BasicInfoStep";
export default BasicInfoStep;
