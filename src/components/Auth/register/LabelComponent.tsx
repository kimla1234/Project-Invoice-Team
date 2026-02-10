import React from 'react';

type LabelProps ={
  htmlFor: string; // ID of the field this label is for
  text: string; // The main label text
  required?: boolean; // Optional flag to show the required indicator
}

function Label({ htmlFor, text, required = false }: LabelProps) {
  return (
    <label
      className="block h-6 font-medium text-textprimary"
      htmlFor={htmlFor}
    >
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

export default Label;
