"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SaveIcon, XIcon, PlusCircleIcon } from "lucide-react";
import { Client, Databases, Query } from "appwrite";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const CUSTOMER_COLLECTION_ID = "6731d3a0001a04a8f849";

const client = new Client()
  .setEndpoint(API_ENDPOINT)
  .setProject(PROJECT_ID);

const databases = new Databases(client);

interface CustomerTestimonialsProps {
  startupId: string;
}

const CustomerTestimonials: React.FC<CustomerTestimonialsProps> = ({ startupId }) => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState<any>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        CUSTOMER_COLLECTION_ID,
        [Query.equal("startupId", startupId)]
      );
      setTestimonials(response.documents);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    }
  }, [startupId]);

  useEffect(() => {
    if (startupId) {
      fetchTestimonials();
    }
  }, [startupId, fetchTestimonials]);

  const handleSave = async () => {
    try {
      const testimonialData = Object.fromEntries(
        Object.entries(currentTestimonial).filter(([key]) => !key.startsWith('$'))
      );

      if (currentTestimonial.$id) {
        await databases.updateDocument(
          DATABASE_ID,
          CUSTOMER_COLLECTION_ID,
          currentTestimonial.$id,
          { ...testimonialData, startupId }
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          CUSTOMER_COLLECTION_ID,
          "unique()",
          { ...testimonialData, startupId }
        );
      }
      setIsDialogOpen(false);
      fetchTestimonials();
      toast({ title: "Testimonial saved successfully!" });
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast({ title: "Error saving testimonial", variant: "destructive" });
    }
  };

  const handleEdit = (testimonial: any) => {
    setCurrentTestimonial(testimonial);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await databases.deleteDocument(DATABASE_ID, CUSTOMER_COLLECTION_ID, currentTestimonial.$id);
      setIsDialogOpen(false);
      fetchTestimonials();
      toast({ title: "Testimonial deleted successfully!" });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({ title: "Error deleting testimonial", variant: "destructive" });
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h2 className="container text-lg font-medium mb-2 -mt-4">Customer Testimonials</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="cursor-pointer" onClick={() => setCurrentTestimonial({})}>
              <PlusCircleIcon size={20} className="mr-3 mb-1" />
            </div>
          </DialogTrigger>
          <DialogContent className="w-full max-w-5xl">
            <DialogHeader>
              <DialogTitle>{currentTestimonial.$id ? "Edit" : "Add"} Testimonial</DialogTitle>
              <DialogDescription>
                Enter the customer testimonial details here. Click save when you re done.
              </DialogDescription>
            </DialogHeader>
            <TestimonialForm
              testimonial={currentTestimonial}
              onChange={setCurrentTestimonial}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          </DialogContent>
        </Dialog>
      </div>
      <TestimonialsTable testimonials={testimonials} onEdit={handleEdit} />
    </div>
  );
};

interface TestimonialFormProps {
  testimonial: any;
  onChange: (testimonial: any) => void;
  onSave: () => void;
  onDelete: () => void;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ testimonial, onChange, onSave, onDelete }) => {
  const handleChange = (field: string, value: string) => {
    onChange({ ...testimonial, [field]: value });
  };

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-4 gap-4 w-full">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            placeholder="Enter customer name"
            value={testimonial.customerName || ""}
            onChange={(e) => handleChange("customerName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            placeholder="Enter designation"
            value={testimonial.designation || ""}
            onChange={(e) => handleChange("designation", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="Enter phone number"
            value={testimonial.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Enter email address"
            value={testimonial.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="query1">What services/products are you using from the company?</Label>
          <Textarea
            id="query1"
            value={testimonial.query1 || ""}
            onChange={(e) => handleChange("query1", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="query2">Your View on Service Utilization-will the service/product be beneficial for your company/personal use</Label>
          <Textarea
            id="query2"
            value={testimonial.query2 || ""}
            onChange={(e) => handleChange("query2", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="query3">Unique selling proposition of the company-what made you switch to using this company s service/product-how were you doing earlier?</Label>
          <Textarea
            id="query3"
            value={testimonial.query3 || ""}
            onChange={(e) => handleChange("query3", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="query4">Future of this Segment- in your view, what will be the future of this segment?</Label>
          <Textarea
            id="query4"
            value={testimonial.query4 || ""}
            onChange={(e) => handleChange("query4", e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button onClick={onSave}>Save</Button>
        {testimonial.$id && (
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

interface TestimonialsTableProps {
  testimonials: any[];
  onEdit: (testimonial: any) => void;
}

const TestimonialsTable: React.FC<TestimonialsTableProps> = ({ testimonials, onEdit }) => {
  return (
    <Table className="border border-gray-100">
      <TableCaption>List of Customer Testimonials</TableCaption>
      <TableHeader>
        <TableRow className="bg-gray-100">
          <TableHead>Customer Name</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>What services/products are using of the company?
          </TableHead>
          <TableHead>Your View on Service Utilization-will the service/product be beneficial for your company/personal use.</TableHead>
          <TableHead>Unique selling proposition of the company-what you switch to using this company’s service/product-how were you doing earlier?
          </TableHead>
          <TableHead>Future of this Segment- in your view, what will be the future of this segment?</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {testimonials.map((testimonial) => (
          <TableRow
            key={testimonial.$id}
            onDoubleClick={() => onEdit(testimonial)}
            className="cursor-pointer hover:bg-gray-100"
          >
            <TableCell>{testimonial.customerName}</TableCell>
            <TableCell>{testimonial.designation}</TableCell>
            <TableCell>{testimonial.phone}</TableCell>
            <TableCell>{testimonial.email}</TableCell>
            <TableCell>{testimonial.query1}</TableCell>
            <TableCell>{testimonial.query2}</TableCell>
            <TableCell>{testimonial.query3}</TableCell>
            <TableCell>{testimonial.query4}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CustomerTestimonials;
