"use client";
import React from "react";
import EmailView from "@/components/email";

const EmailPage = () => {
    const email = {
        id: '1',
        from: 'example@example.com',
        subject: 'Sample Subject',
        replyTo: 'reply@example.com',
        date: 'June 1, 2023',
        content: 'This is a sample email content.'
      }
  return (
    <>
    <EmailView email={email} />
    </>
  ) 
};

export default EmailPage;
