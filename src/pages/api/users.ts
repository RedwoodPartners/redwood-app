import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Users } from 'node-appwrite';
import { API_ENDPOINT, PROJECT_ID } from '@/appwrite/config';

export const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

const client = new Client()
  .setEndpoint(API_ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const users = new Users(client);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const allUsers = await users.list();
      const enrichedUsers = await Promise.all(
        allUsers.users.map(async (user: any) => {
          try {
            const sessions = await users.listSessions(user.$id);
            const latestSession = sessions.sessions[0];
            const labels = user.labels.length > 0 ? user.labels : ['User']; // Set default label
            return {
              ...user,
              labels,
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
              labels: ['User'], // Default label in case of error
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
  } else if (req.method === 'POST') {
    // Update user label
    const { userId, newLabel } = req.body;
    try {
      await users.updateLabels(userId, [newLabel]); // method for updating labels
      res.status(200).json({ message: 'User label updated successfully' });
    } catch (error) {
      console.error('Error updating user label:', error);
      res.status(500).json({ error: 'Failed to update user label. Please try again later.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}