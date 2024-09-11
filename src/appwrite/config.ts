import { Client, Account, ID } from "appwrite";
import { v4 as uuidv4 } from 'uuid';

export const API_ENDPOINT = 'https://cloud.appwrite.io/v1';
export const PROJECT_ID = '66d94ffb0025a8aa0b9d';

type CreateUserAccount = {
  email: string;
  password: string;
  name: string;
};



const appwriteClient = new Client()
  .setEndpoint(API_ENDPOINT)
  .setProject(PROJECT_ID);

const account = new Account(appwriteClient);

export class AppwriteService {
  async createUserAccount({ email, password, name }: CreateUserAccount) {
    try {
      // userId using uuidv4
      const userId = uuidv4().replace(/-/g, '');
      
      const userAccount = await account.create(userId, email, password, name);
      console.log('Account creation response:', userAccount);
      alert("Successful");
      return userAccount; 

    } catch (error: any) {
      console.error("Error creating user account:", error.message);
      throw new Error(error.message || "Unable to create account. Please try again.");
    }
  }

  
  async isLoggedIn(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user; 
    } catch (error: any) {
      console.error("Error checking login status:", error.message);
      return false;
    }
  }

  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error: any) {
      console.error("Error fetching current user:", error.message);
      throw new Error("Unable to retrieve current user.");
    }
  }

  async logout() {
    try {
      return await account.deleteSession("current");
    } catch (error: any) {
      console.error("Logout error:", error.message);
      throw new Error("Unable to log out. Please try again.");
    }
  }
}
export const loginUser = async (email: string, password: string) => {
  try {
    // Create a session using email and password
    return await account.createEmailPasswordSession(email, password);
  } catch (error: any) {
    console.error("Login error:", error.message);
    throw new Error(error.message || "Unable to login. Please check your credentials.");
  }
};

const appwriteService = new AppwriteService();
export default appwriteService;