import { Client, Account, ID, OAuthProvider } from "appwrite";
import { v4 as uuidv4 } from 'uuid';

export const API_ENDPOINT = 'https://cloud.appwrite.io/v1';
export const PROJECT_ID = '66d94ffb0025a8aa0b9d';

type CreateUserAccount = {
  email: string;
  password: string;
  name: string;
}

type LoginUserAccount = {
  email: string,
  password: string,
}



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
      alert("Successful")
      if (userAccount) {
        return this.login({email, password})
      } else {
        return userAccount
      } 

    } catch (error: any) {
      console.error("Error creating user account:", error.message);
      throw new Error(error.message || "Unable to create account. Please try again.");
    }
  }

  async login( { email, password }: LoginUserAccount) {
    try {
         return await account.createEmailPasswordSession(email, password)
    } catch (error:any) {
      throw error
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
        return account.get()
    } catch (error) {
        console.log("getcurrentUser error: " + error)
        
    }

    return null
  }



  async loginWithGoogle(successRedirectUrl: string, failureRedirectUrl: string) {
    try {
      // Use OAuthProvider.GOOGLE instead of the string "Google"
      await account.createOAuth2Session(OAuthProvider.Google, "http://localhost:3000/profile", "http://localhost:3000/");
    } catch (error: any) {
      console.error("Error during Google login:", error.message);
      throw new Error(error.message || "Google login failed.");
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




const appwriteService = new AppwriteService();
export default appwriteService;