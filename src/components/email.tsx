"use client";

import React, { useEffect, useState } from "react";
import { Client, Databases, Account, Models, Query } from "appwrite";
import { PROJECT_ID, API_ENDPOINT, DATABASE_ID } from "@/appwrite/config";
import { Button } from "@/components/ui/button";
import { RealtimeResponseEvent } from 'appwrite';

const MESSAGES_COLLECTION_ID = "6770e11a0008b9a32f6c";

const client = new Client();
client.setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);
const account = new Account(client);

const SendMessage: React.FC = () => {
  const [users, setUsers] = useState<Models.Document[]>([]);
  const [selectedReceiver, setSelectedReceiver] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Models.Document[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<{ [key: string]: Set<string> }>({});

  useEffect(() => {
    account.get().then(
      (user) => {
        setCurrentUserEmail(user.email);
      },
      (err) => {
        console.error("Error fetching current user:", err);
        setError("Failed to fetch current user.");
      }
    );

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users.");
      }
    };

    fetchUsers();

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
      (response: RealtimeResponseEvent<Models.Document>) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          const newMessage = response.payload;
          if (newMessage.receiverEmail === currentUserEmail) {
            setUnreadMessages((prev) => {
              const newUnreadMessages = { ...prev };
              if (!newUnreadMessages[newMessage.senderEmail]) {
                newUnreadMessages[newMessage.senderEmail] = new Set();
              }
              newUnreadMessages[newMessage.senderEmail].add(newMessage.$id);
              return newUnreadMessages;
            });
            if (selectedReceiver === newMessage.senderEmail) {
              setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserEmail, selectedReceiver]);

  const fetchMessages = async (receiverEmail: string) => {
    if (!currentUserEmail) return;
  
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
          Query.or([
            Query.and([
              Query.equal("senderEmail", currentUserEmail),
              Query.equal("receiverEmail", receiverEmail)
            ]),
            Query.and([
              Query.equal("senderEmail", receiverEmail),
              Query.equal("receiverEmail", currentUserEmail)
            ])
          ]),
          Query.orderAsc("timestamp")
        ]
      );
      setMessages(response.documents);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages.");
    }
  };

  const handleSelectUser = (email: string) => {
    setSelectedReceiver(email);
    fetchMessages(email);
  };

  const handleSendMessage = async () => {
    if (!selectedReceiver || !messageContent || !currentUserEmail) {
      setError("Please select a receiver and enter a message.");
      return;
    }

    try {
      const newMessage = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        "unique()",
        {
          senderEmail: currentUserEmail,
          receiverEmail: selectedReceiver,
          content: messageContent,
          timestamp: new Date().toISOString(),
        }
      );

      setSuccessMessage("Message sent successfully!");
      setMessageContent("");
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    }
  };

  const markMessagesAsRead = () => {
    if (selectedReceiver && unreadMessages[selectedReceiver]) {
      setUnreadMessages((prev) => {
        const newUnreadMessages = { ...prev };
        delete newUnreadMessages[selectedReceiver];
        return newUnreadMessages;
      });
    }
  };

  return (
    <div className="container mx-auto p-4 flex">
      <div className="flex-grow mr-4">
        <h1 className="text-xl font-semibold mb-4">Messages</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

        {selectedReceiver ? (
          <>
            <div 
              className="mb-4 h-96 overflow-y-auto border border-gray-300 rounded p-4"
              onScroll={markMessagesAsRead}
            >
              {messages.map((message) => (
                <div key={message.$id} className={`mb-2 p-2 rounded ${message.senderEmail === currentUserEmail ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
                  <p className="font-semibold">{message.senderEmail === currentUserEmail ? 'You' : message.senderEmail}</p>
                  <p>{message.content}</p>
                  <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                className="w-full border border-gray-300 rounded p-2"
                rows={3}
              />
            </div>

            <Button onClick={handleSendMessage}>
              Send Message
            </Button>
          </>
        ) : (
          <p>Select a user to start messaging</p>
        )}
      </div>

      <div className="w-64">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.$id}
              className={`p-2 rounded cursor-pointer ${selectedReceiver === user.email ? 'bg-blue-100' : 'hover:bg-gray-100'} flex justify-between items-center`}
              onClick={() => handleSelectUser(user.email)}
            >
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              {unreadMessages[user.email] && unreadMessages[user.email].size > 0 && (
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SendMessage;
