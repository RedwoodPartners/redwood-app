"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AboutBusiness: React.FC = () => {
  return (
    <div>
      <h2 className="container text-xl font-bold mb-4 -mt-6">About Business</h2>
      <AccordionDemo />
    </div>
  );
};

export default AboutBusiness;

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1" className="px-3 mb-2 mx-auto bg-white rounded-lg shadow-lg border border-gray-100">
        <AccordionTrigger className="text-sm font-semibold">
          Problem Statement
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700">
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2" className="px-3 mb-2 mx-auto bg-white rounded-lg shadow-lg border border-gray-100">
        <AccordionTrigger className="text-sm font-semibold">
          current stage of Solution/Idea
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700">
          Yes. It comes with default styles that match the other components' aesthetic.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3" className="px-3 mb-2 mx-auto bg-white rounded-lg shadow-lg border border-gray-100">
        <AccordionTrigger className="text-sm font-semibold">
          OtherCurrent Business Lines
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700">
          Yes. It comes with default styles that match the other components' aesthetic.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-4" className="px-3 mb-2 mx-auto bg-white rounded-lg shadow-lg border border-gray-100">
        <AccordionTrigger className="text-sm font-semibold">
          Future Business Lines
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700">
          Yes. It comes with default styles that match the other components' aesthetic.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-5" className="px-3 mb-2 mx-auto bg-white rounded-lg shadow-lg border border-gray-100">
        <AccordionTrigger className="text-sm font-semibold">
          Market Overview
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700">
          Yes. It comes with default styles that match the other components' aesthetic.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-6" className="px-3 mb-2 mx-auto bg-white rounded-lg shadow-lg border border-gray-100">
        <AccordionTrigger className="text-sm font-semibold">
          Solution Overview
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700">
          Yes. It comes with default styles that match the other components' aesthetic.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-7" className="px-3 mb-2 mx-auto bg-white rounded-lg shadow-lg border border-gray-100">
        <AccordionTrigger className="text-sm font-semibold">
          Competition
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700">
          Yes. It comes with default styles that match the other components' aesthetic.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-8" className="px-3 mb-2  mx-auto bg-white rounded-lg shadow-lg border border-gray-100">
        <AccordionTrigger className="text-sm font-semibold">
          Opportunity Analysis
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700">
          Yes. It's animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
