"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaRegUser, FaBriefcase, FaHospital, FaFileAlt } from "react-icons/fa";
import BasicInfoStep from "./BasicInfoStep";
import CompanyStep from "./CompanyStep";
import CompanyDetailsStep from "./CompanyDetailsStep";
import DocumentsStep from "./DocumentsStep";
import { FullFormData } from "@/types/formData";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "registration_form_data";
const STEP_KEY = "registration_current_step";

const steps = [
  {
    id: 1,
    name: "Account Information",
    icon: FaRegUser,
    component: BasicInfoStep,
  },
  { id: 2, name: "Company Info", icon: FaBriefcase, component: CompanyStep },
  {
    id: 3,
    name: "Clinic Details",
    icon: FaHospital,
    component: CompanyDetailsStep,
  },
  { id: 4, name: "Documents", icon: FaFileAlt, component: DocumentsStep },
];

export default function MultiStepForm() {
  const router = useRouter();
  const currentStepRef = useRef<any>(null);

  // 1. Initialize state from localStorage if it exists
  const [formData, setFormData] = useState<FullFormData>({
    fullName: "",
    email: "",
    companyName: "",
    companyAddress: "",
    companyLogo: undefined,
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // 2. Load data from LocalStorage on Mount

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedStep = localStorage.getItem(STEP_KEY);

    if (savedData) {
      setFormData((prev) => ({
        ...prev,
        ...JSON.parse(savedData),
      }));
    }

    if (savedStep) setCurrentStepIndex(Number(savedStep));

    setIsInitialized(true);
  }, []);

  //useEffect(() => {
   // if (isInitialized) {
      // Create a copy of the data without the File object
    //  const { companyLogo, ...restOfData } = formData;

     // localStorage.setItem(STORAGE_KEY, JSON.stringify(restOfData));
     // localStorage.setItem(STEP_KEY, currentStepIndex.toString());
   // }
  //}, [formData, currentStepIndex, isInitialized]);

  // 3. Save data to LocalStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      localStorage.setItem(STEP_KEY, currentStepIndex.toString());
    }
  }, [formData, currentStepIndex, isInitialized]);

  const updateFormData = (data: Partial<FullFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    if (!currentStepRef.current) return;

    const isValid = await currentStepRef.current.validateAndSave?.();

    if (!isValid) return;

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // FINAL SUBMISSION / "LOGIN" LOGIC
      handleFinalSubmit();
    }
  };

  // Inside MultiStepForm.tsx
  const handleFinalSubmit = () => {
    // Save the full data as a "Registered User"
    localStorage.setItem("registered_user", JSON.stringify(formData));

    // Clear the draft progress so they don't see the form again
    localStorage.removeItem("registration_form_data");
    localStorage.removeItem("registration_current_step");

    // Redirect to login
    router.push("/login");
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Prevent hydration mismatch by not rendering until loaded from localstorage
  if (!isInitialized) return <div className="p-10 text-center">Loading...</div>;

  const CurrentStepComponent = steps[currentStepIndex].component;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="mx-auto max-w-4xl p-5 md:p-8">
      {/* Progress Header */}
      <div className="mb-3 flex items-center justify-between rounded-xl border bg-white p-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStepIndex;
          return (
            <div
              key={step.id}
              className={`flex items-center space-x-2 ${isActive ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`rounded-full p-3 ${isActive ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="hidden text-sm font-medium sm:inline">
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <span className="text-gray-300">→</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border-[0.5px] bg-white p-6 md:p-10">
        <CurrentStepComponent
          ref={currentStepRef}
          updateFormData={updateFormData}
          data={formData}
        />

        <div className="mt-5 flex pt-3">
          {!isFirstStep ? (
            <button
              onClick={handleBack}
              className="rounded-lg bg-gray-100 px-6 py-2 text-gray-700 hover:bg-gray-200"
            >
              Back
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border bg-gray-100 px-6 py-2 text-gray-700 hover:bg-gray-200"
            >
              Back to Login
            </Link>
          )}
          <button
            onClick={handleNext}
            className={`ml-auto rounded-lg px-8 py-2 font-medium text-white ${
              isLastStep
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLastStep ? "Complete Registration" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
