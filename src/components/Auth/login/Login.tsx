"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  setAccessToken,
  //setAuthenticated,
} from "@/redux/feature/auth/authSlice";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import { IoCloseSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  //const token = useSelector((state: RootState) => state.auth.token);

 const [redirectPath, setRedirectPath] = useState("/");

  // Parse redirect query from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || "/";
    setRedirectPath(redirect);
  }, []);

 
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);

      try {
        // --- START OF ACTUAL API LOGIC ---
        const response = await fetch(`/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast({
            title: "Authentication Failed",
            description: data.message || "Invalid email or password.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { accessToken } = data;
        if (accessToken) {
          dispatch(setAccessToken(accessToken));

          console.log("Dispatched Access Token:", accessToken);
          toast({
            title: "Logged in Successfully 🎉",
            description: "Your action was completed successfully.",
            variant: "success", // Use "destructive" for error messages
            duration: 2000,
          });
          // toast.success("Logged in Successfully.", {
          //   autoClose: 3000,
          // });
          router.push(`/`);

          console.log("Access token: ", data.accessToken);
        }
        // --- END OF ACTUAL API LOGIC ---
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
  });
  const handleGoogleLogin = () => {
  window.location.href = "https://invoice.kimla.online/oauth2/authorization/google";
};

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 md:bg-white">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="flex h-full w-full bg-white">
        {/* LEFT SIDE: IMAGE/VISUAL (Hidden on mobile) */}
        <div className="relative hidden h-screen w-[60%] bg-blue-600 md:block">
          <img
            src="https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80"
            alt="Security Visual"
            className="h-full w-full object-cover opacity-40 mix-blend-multiply"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
            <h1 className="mb-4 text-4xl font-bold">Secure Your Account</h1>
            <p className="text-lg text-blue-100">
              Don't worry, it happens to the best of us. Let's get you back in.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="flex h-screen w-full flex-col justify-center p-8 md:w-1/2 lg:p-12">
          {/* Header (Top) */}
          <div className="flex items-center justify-end py-6">
            <button
              onClick={() => router.push("/")}
              className="rounded-full bg-purple-100 p-2 text-gray-500 transition hover:bg-red-100"
            >
              <IoCloseSharp size={24} />
            </button>
          </div>

          <div className="flex-1 items-center">
            <div className="w-full p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
                <p className="mt-2 text-gray-500">
                  Please enter your details to login.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mb-6 flex w-full items-center justify-center rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50 active:scale-95"
              >
                <img
                  src="https://logowik.com/content/uploads/images/985_google_g_icon.jpg"
                  alt="Google"
                  className="mr-3 h-5 w-auto"
                />
                Continue with Google
              </button>

              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-4 text-xs font-bold uppercase text-gray-400">
                  OR
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div
                    className={`flex items-center rounded-xl border bg-gray-50 px-4 py-3 transition-all ${
                      formik.touched.email && formik.errors.email
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-primary"
                    }`}
                  >
                    <i className="fas fa-envelope mr-3 text-gray-400"></i>
                    <input
                      type="email"
                      {...formik.getFieldProps("email")}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="name@company.com"
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div
                    className={`flex items-center rounded-xl border bg-gray-50 px-4 py-3 transition-all ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-primary"
                    }`}
                  >
                    <i className="fas fa-lock mr-3 text-gray-400"></i>
                    <input
                      type={showPassword ? "text" : "password"}
                      {...formik.getFieldProps("password")}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-primary"
                    >
                      <i
                        className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`}
                      ></i>
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      {...formik.getFieldProps("remember")}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 cursor-pointer text-sm text-gray-600"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-primary hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full transform rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? (
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-600">
                Don't have an account?
                <Link
                  href={`/register`}
                  className="ml-1 font-bold text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
