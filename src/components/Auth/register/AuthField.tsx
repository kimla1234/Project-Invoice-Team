import React from 'react';
import { Field } from 'formik';

type FieldProps ={
  type: string;
  name: string;
  id: string;
  placeholder: string;
}

const DynamicField = ({ type, name, id, placeholder }: FieldProps) => {
  return (
    <Field
      type={type}
      name={name}
      id={id}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-3  border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-textprimary"
    />
  );
};

export default DynamicField;
