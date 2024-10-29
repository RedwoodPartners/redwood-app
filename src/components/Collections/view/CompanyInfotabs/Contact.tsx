"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Contact: React.FC = () => {
  return (
    <div>
      <h2 className="container text-xl font-bold mb-4 -mt-6">Contact</h2>
      <div className="grid grid-cols-2 gap-8">

        {/* Combined Box for Website, Email, Primary and Secondary Phone Numbers */}
        <div className="space-y-4 border border-gray-300 p-4 rounded-md shadow-sm">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="website" className="font-semibold text-gray-700">Company Website</Label>
            <Input id="website" placeholder="Website URL" defaultValue="Value" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
            <Input id="email" placeholder="Email" defaultValue="Value" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="primaryPhone" className="font-semibold text-gray-700">Primary Phone Number</Label>
            <Input id="primaryPhone" placeholder="Primary Phone" defaultValue="Value" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="secondaryPhone" className="font-semibold text-gray-700">Secondary Phone Number</Label>
            <Input id="secondaryPhone" placeholder="Secondary Phone" defaultValue="Value" />
          </div>
        </div>

        {/* Box for Registered Address */}
        <div className="space-y-4 border border-gray-300 p-4 rounded-md shadow-sm">
          <h3 className="font-bold text-lg">Registered Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="address1" className="font-semibold text-gray-700">Address line 1</Label>
              <Input id="address1" placeholder="Address line 1" defaultValue="Value" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="address2" className="font-semibold text-gray-700">Address line 2</Label>
              <Input id="address2" placeholder="Address line 2" defaultValue="Value" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="city" className="font-semibold text-gray-700">City</Label>
              <Input id="city" placeholder="City" defaultValue="Value" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="state" className="font-semibold text-gray-700">State</Label>
              <Input id="state" placeholder="State" defaultValue="Value" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
