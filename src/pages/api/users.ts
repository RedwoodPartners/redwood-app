import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Users } from 'node-appwrite';
import { API_ENDPOINT, PROJECT_ID } from '@/appwrite/config';

const API_KEY = "standard_68a02ae90f1ed92161fae179dd3aa5977d083a2b8558b057ab3057a20469e24ce14777def337098f3274d9d18d14db6b198c389e9ab3b80a61b0ce95ddc062807ae79e144716c1a049b029b88f1a54a43b0e387a7605f6aa35e025735f946b7ac1f9c5697ad8cb0d12b9fd07e5fa619f4d7caba6867bd36eb849b1293b90c661";

const client = new Client()
  .setEndpoint(API_ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const users = new Users(client);

interface AppwriteSession {
  $id: string;
  userId: string;
  expire: string;
  createdAt?: string;
  [key: string]: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Fetch all users directly from Appwrite
    const allUsers = await users.list();

    const enrichedUsers = await Promise.all(
      allUsers.users.map(async (user: any) => {
        try {
          // Fetch user sessions for the latest session data
          const sessions = await users.listSessions(user.$id);
          const latestSession = sessions.sessions[0] as AppwriteSession | undefined;
    
          // Fetch labels directly from the user object
          const labels = user.labels || [];
    
          return {
            ...user,
            labels, // Include labels from the user object
            currentSession: latestSession
              ? `Session active since ${new Date(latestSession.expire).toLocaleString()}`
              : 'No active session',
            latestActivity: latestSession?.expire
              ? `${new Date(latestSession.expire).toLocaleString()}`
              : 'No recent activity',
          };
        } catch (err) {
          console.error(`Error fetching sessions or labels for user ${user.$id}:`, err);
          return {
            ...user,
            labels: [],
            currentSession: 'Error fetching session',
            latestActivity: 'Error fetching activity',
          };
        }
      })
    );
    

    res.status(200).json({ users: enrichedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users. Please try again later.' });
  }
}
