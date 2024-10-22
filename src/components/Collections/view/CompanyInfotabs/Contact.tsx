"use client";
import React from "react";

const Contact: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mt-8 mb-4">Contact</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-700">Company Website</p>
          <p className="text-gray-600">Value</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Email</p>
          <p className="text-gray-600">Value</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Primary Phone Number</p>
          <p className="text-gray-600">Value</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Secondary Phone Number</p>
          <p className="text-gray-600">Value</p>
        </div>

        {/* Registered Address */}
        <div className="col-span-2">
          <h3 className="font-bold text-lg mt-6 mb-2">Registered Address</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="font-semibold text-gray-700">Address line 1</p>
              <p className="text-gray-600">Value</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Address line 2</p>
              <p className="text-gray-600">Value</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">City</p>
              <p className="text-gray-600">Value</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">State</p>
              <p className="text-gray-600">Value</p>
            </div>
            
          </div>

  
             
  
        </div> 
      </div> 
    </div> 
  ); 
};

export default Contact;