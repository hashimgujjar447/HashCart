import React, { forwardRef } from 'react';

interface BaseProps {
  label?: string;
  type?: string;
  className?: string;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

type TextAreaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextAreaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = 'text', className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-200">
            {label}
          </label>
        )}
        {type === 'textarea' ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder:text-gray-500 ${className}`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            className={`bg-[#11141a] border border-[#2b3342] text-gray-200 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder:text-gray-500 ${className}`}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export default Input;
