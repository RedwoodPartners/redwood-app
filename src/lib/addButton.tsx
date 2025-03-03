"use client";
import React from "react";
import { PlusCircle } from "lucide-react";

interface ButtonWithIconProps {
  label: string;
  onClick?: () => void;
}

const ButtonWithIcon: React.FC<ButtonWithIconProps> = ({ label, onClick }) => {
  return (
    <div className="p-1">
    <span
      className="flex items-center border border-gray-300 rounded-full cursor-pointer p-1 space-x-1"
      onClick={onClick}
    >
      <PlusCircle size={15} className="cursor-pointer" />
      <span className="text-xs font-thin">{label}</span>
    </span>
    </div>
  );
};

export default ButtonWithIcon;
