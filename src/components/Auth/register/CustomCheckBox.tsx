import { Field } from "formik";
import { FaCheck } from "react-icons/fa6";

const CustomCheckbox = ({ id, name }: { id: string; name: string }) => {
  return (
    <div className="flex items-center">
      {/* Hidden Checkbox */}
      <Field
        type="checkbox"
        id={id}
        name={name}
        className="hidden peer" // Enable peer styles
      />

      {/* Custom Checkbox */}
      <label
        htmlFor={id}
        className="w-4 h-4 p-0.5 border-2 border-gray-300 rounded-[5px] flex items-center justify-center cursor-pointer peer-checked:border-primary peer-checked:bg-primary transition"
      >
        {/* Checkmark Icon */}
        <FaCheck
          className="text-white text-md  peer-checked:block"
        />
      </label>

      {/* Label Text */}
      {/* <span classNa me="ml-2 text-gray-700">Your Text Here</span> */}
    </div>
  );
};

export default CustomCheckbox;

