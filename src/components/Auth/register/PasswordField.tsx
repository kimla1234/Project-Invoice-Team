import React, { useState } from 'react';
import { Field } from 'formik';
import { IoEyeOffSharp, IoEyeSharp } from 'react-icons/io5';

type PasswordFieldProps ={
  name: string; // Field name
  id: string; // ID for the input field
  placeholder?: string; // Placeholder for the input
  className?: string; // Additional custom styles for the input field
}

function PasswordField({ name, id, placeholder = "Enter password", className = "" }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="relative">
      <Field
        type={showPassword ? "text" : "password"}
        name={name}
        id={id}
        className={`w-full text-textprimary py-3 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary ${className}`}
        placeholder={placeholder}
      />
      {showPassword ? (
        <IoEyeSharp
          onClick={handleTogglePassword}
          className="absolute right-3 top-7 transform -translate-y-1/2 cursor-pointer text-gray-500"
        />
      ) : (
        <IoEyeOffSharp
          onClick={handleTogglePassword}
          className="absolute right-3 top-7 transform -translate-y-1/2 cursor-pointer text-gray-500"
        />
      )}
    </div>
  );
}

export default PasswordField;


