"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null); // State for auth errors
  const router = useRouter();

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
      setLoginError(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 1. Look for the "registered_user" key we defined in the form
        const savedUserData = localStorage.getItem("registered_user");

        if (!savedUserData) {
          setLoginError("No account found. Please register first.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(savedUserData);

        // 2. Verify credentials
        if (user.email === values.email && user.password === values.password) {
          // Create a session so the app knows we are logged in
          localStorage.setItem(
            "user_session",
            JSON.stringify({ ...user, isLoggedIn: true }),
          );
          router.push("/");
        } else {
          setLoginError("Invalid email or password.");
        }
      } catch (error) {
        setLoginError("An error occurred.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="w-full max-w-md animate-[fadeIn_0.6s_ease-out] overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-center">
          <h2 className="relative z-10 text-2xl font-bold text-white">
            Welcome Back
          </h2>
          <p className="relative z-10 mt-1 text-blue-100">
            Sign in to your account
          </p>
        </div>

        <div className="p-8">
          {/* Display Login Errors */}
          {loginError && (
            <div className="mb-4 flex items-center rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {loginError}
            </div>
          )}

          <button className="mb-6 flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50">
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

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <div
                className={`rounded-lg border bg-gray-50 transition-all duration-300 ${formik.touched.email && formik.errors.email ? "border-red-500" : "border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"}`}
              >
                <label className="block px-4 pt-3 text-[10px] font-bold uppercase text-gray-400">
                  Email Address
                </label>
                <div className="flex items-center px-4 pb-2">
                  <i className="fas fa-envelope mr-2 text-sm text-gray-400"></i>
                  <input
                    type="email"
                    {...formik.getFieldProps("email")}
                    className="w-full bg-transparent py-1 text-sm outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="ml-1 mt-1 text-xs text-red-500">
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div
                className={`rounded-lg border bg-gray-50 transition-all duration-300 ${formik.touched.password && formik.errors.password ? "border-red-500" : "border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"}`}
              >
                <label className="block px-4 pt-3 text-[10px] font-bold uppercase text-gray-400">
                  Password
                </label>
                <div className="flex items-center px-4 pb-2">
                  <i className="fas fa-lock mr-2 text-sm text-gray-400"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...formik.getFieldProps("password")}
                    className="w-full bg-transparent py-1 text-sm outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 transition-colors hover:text-blue-500"
                  >
                    <i
                      className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`}
                    ></i>
                  </button>
                </div>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="ml-1 mt-1 text-xs text-red-500">
                  {formik.errors.password}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  onChange={formik.handleChange}
                  checked={formik.values.remember}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 cursor-pointer text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full transform rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i> Signing
                  In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?
            <Link
              href="/register"
              className="ml-1 font-bold text-blue-600 hover:underline"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
