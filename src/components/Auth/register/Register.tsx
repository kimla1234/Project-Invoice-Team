"use client";
import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoCloseSharp } from "react-icons/io5";

// Redux & Hooks
import { useAppDispatch } from "@/redux/hooks";
import { useRegisterMutation } from "@/redux/service/auth";

import { useToast } from "@/hooks/use-toast";

// Components
import Label from "./LabelComponent";
import DynamicField from "./AuthField";
import ErrorDynamic from "./ErrorComponent";
import PasswordField from "./PasswordField";
import Button from "./ButtonComponentForAuth";
import CustomCheckbox from "./CustomCheckBox";

type ValueTypes = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

const initialValues: ValueTypes = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

const strongPasswordRegex = new RegExp(
  "^(?=.*[A-Z])(?=.*[a-z])(?=.*[@#$%^&*]).{8,}$",
);

export const Register = () => {
  const dispatch = useAppDispatch();
  const [register] = useRegisterMutation();
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .max(60, "ឈ្មោះរបស់អ្នកវែងពេក")
      .required("អ្នកត្រូវបញ្ជូលឈ្មោះរបស់អ្នក"),
    email: Yup.string()
      .email("អ៉ីម៉ែលរបស់អ្នកមិនត្រឹមត្រូវ")
      .required("អ្នកត្រូវបញ្ជូលអ៉ីម៉ែលរបស់អ្នក"),
    password: Yup.string()
      .min(8, "ពាក្យសម្ងាត់យ៉ាងតិច 8 តួរ")
      .matches(strongPasswordRegex, "ត្រូវមានអក្សរធំ តូច និងនិមិត្តសញ្ញាពិសេស")
      .required("ពាក្យសម្ងាត់ត្រូវតែបញ្ជូល"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "ពាក្យសម្ងាត់មិនដូចគ្នាទេ")
      .required("អ្នកត្រូវបញ្ជាក់ពាក្យសម្ងាត់"),
    terms: Yup.bool().oneOf([true], "អ្នកត្រូវតែយល់ព្រមតាមលក្ខខណ្ឌ"),
  });

  const handleSubmit = async (values: ValueTypes) => {
    setIsLoading(true);
    try {
      const { name, email, password, confirmPassword } = values;
      const response = await register({
        data: {
          name,
          email,
          password,
          confirmPassword,
        },
      }).unwrap();

      // dispatch(setEmail(email));
      toast({
        title: "ចុះឈ្មោះជោគជ័យ!",
        description: response.message || "សូមពិនិត្យមើលអ៉ីម៉ែលរបស់អ្នក។",
        variant: "success",
        duration: 4000,
      });

      // ប្តូរទៅកាន់ទំព័រផ្ទៀងផ្ទាត់លេខកូដ (OTP)
      router.push(`/verify-code-register`);
    } catch (error: any) {
      // RTK Query errors usually look like this: { status: 400, data: { detail: "..." } }
      const errorMessage =
        error?.data?.detail ||
        error?.data?.message ||
        "ការចុះឈ្មោះមានបញ្ហា (Error: " + error?.status + ")";

      toast({
        title: "បរាជ័យ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

          <section className="h-full w-full ">
            <div className="m-auto  w-full overflow-hidden rounded-xl  bg-white ">
              <div className="h-full justify-between lg:flex">
                {/* ផ្នែកខាងស្តាំ: Form ចុះឈ្មោះ */}
                <div className="flex w-full flex-col ">
                  

                  <div className="flex-1 overflow-y-auto px-8 pb-10 lg:px-12">
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold text-gray-800">
                        Register
                      </h1>
                      <p className="text-gray-500">Please fill in the information below.</p>
                    </div>

                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ errors, touched }) => (
                        <Form className="space-y-4">
                          <div>
                            <Label
                              htmlFor="name"
                              text="Name"
                              required
                            />
                            <DynamicField
                              type="text"
                              id="name"
                              name="name"
                              placeholder="Input your name"
                            />
                            <ErrorDynamic name="name" component="div" />
                          </div>

                          <div>
                            <Label htmlFor="email" text="Email" required />
                            <DynamicField
                              name="email"
                              type="email"
                              id="email"
                              placeholder="example: name@gmail.com"
                            />
                            <ErrorDynamic name="email" component="div" />
                          </div>

                          <div>
                            <Label
                              htmlFor="password"
                              text="Password"
                              required
                            />
                            <PasswordField
                              name="password"
                              id="password"
                              placeholder="Input your password"
                            />
                            <ErrorDynamic name="password" component="div" />
                          </div>

                          <div>
                            <Label
                              htmlFor="confirmPassword"
                              text="Confirm Password"
                              required
                            />
                            <PasswordField
                              name="confirmPassword"
                              id="password"
                              placeholder="confirm Password"
                            />
                            <ErrorDynamic
                              name="confirmPassword"
                              component="div"
                            />
                          </div>

                          <div className="flex items-start space-x-2 pt-2">
                            <CustomCheckbox id="terms" name="terms" />
                            <label
                              htmlFor="terms"
                              className="text-sm text-gray-600"
                            >
                              I agree{" "}
                              <Link
                                href="/privacy-policy"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                Terms and Conditions
                              </Link>
                            </label>
                          </div>
                          {errors.terms && touched.terms && (
                            <div className="text-xs text-red-500">
                              {errors.terms}
                            </div>
                          )}

                          <Button
                            type="submit"
                            text="Register"
                            isLoading={isLoading}
                            className="mt-4 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-700"
                          />

                          <div className="my-6 flex items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="px-3 text-sm italic text-gray-400">
                              Or
                            </span>
                            <div className="flex-grow border-t border-gray-200"></div>
                          </div>

                          <p className="text-center text-gray-600">
                           Already have an account?
                            <Link
                              href="/login"
                              className="ml-2 font-bold text-blue-600 hover:underline"
                            >
                              Login
                            </Link>
                          </p>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
