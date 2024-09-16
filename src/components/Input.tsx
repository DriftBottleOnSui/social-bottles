import React, { useState } from "react";
import toast from "react-hot-toast";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function Input(props: InputProps) {
  const isFileInput = props.type === "file";
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size cannot exceed 50MB");
        e.target.value = "";

        return;
      }
      setFileName(file.name);
      if (props.onChange) {
        props.onChange(e);
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;

    if (new Blob([text]).size <= 256) {
      if (props.onChange) {
        props.onChange(e);
      }
    } else {
      toast.error("Text must be 256 bytes or less");
    }
  };

  return (
    <div className="relative w-full h-16">
      <input
        {...props}
        accept={isFileInput ? "image/*,audio/*,video/*" : undefined}
        className={`w-full h-full bg-contain bg-no-repeat bg-center px-4 outline-none focus:outline-none border-none ${isFileInput ? "opacity-0 absolute inset-0 z-10 cursor-pointer" : ""} ${props.className || ""}`}
        maxLength={256}
        style={{
          backgroundImage: isFileInput ? "none" : `url(/images/input-bg.svg)`,
          ...props.style,
        }}
        onChange={isFileInput ? handleFileChange : handleTextChange}
      />
      {isFileInput && (
        <div
          className="absolute inset-0 flex items-center px-4 bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: `url(/images/input-bg.svg)` }}
        >
          <span className="text-gray-500">{fileName || "Choose a file"}</span>
        </div>
      )}
    </div>
  );
}

export default Input;
