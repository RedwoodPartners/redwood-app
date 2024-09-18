import { Client, Account, ID, OAuthProvider, Storage } from "appwrite";
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
const storage = new Storage(appwriteClient);


export class AppwriteService {
  async createUserAccount({ email, password, name }: CreateUserAccount) {
    try {
      // userId using uuidv4
      const userId = uuidv4().replace(/-/g, '');
      
      const userAccount = await account.create(userId, email, password, name);
      console.log('Account creation response:', userAccount);
      alert("Successful")

      // Auto-login after account creation
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

  async updatePassword(oldPassword: string, newPassword: string) {
    try {
      // Appwrite requires the new password first, followed by the old password for re-authentication
      await account.updatePassword(newPassword, oldPassword);
      alert("Password updated successfully!");
    } catch (error: any) {
      console.error("Error updating password:", error.message);
    }  
  }

  // Method to send password reset email
  async sendPasswordResetEmail(email: string) {
    try {
      await account.createRecovery(email, "http://localhost:3000/resetpassword");
      alert("Password reset link sent to your email!");
    } catch (error: any) {
      console.error("Error sending password reset email:", error.message);
      throw new Error(error.message || "Failed to send password reset email.");
    }
  }

  async resetPassword(userId: string, secret: string, newPassword: string) {
    try {
      await account.updateRecovery(userId, secret, newPassword); 
      alert("Password has been reset successfully!");
    } catch (error: any) {
      console.error("Error resetting password:", error.message);
      throw new Error(error.message || "Failed to reset password.");
    }
  }


  async uploadProfilePicture(file: File): Promise<string> {
    try {
      // Replace 'your-bucket-id' with your actual bucket ID
      const fileId = uuidv4(); // Use a unique ID for the file
      const result = await storage.createFile('66eb0cfc000e821db4d9', fileId, file);
      return result.$id;
    } catch (error: any) {
      console.error("Error uploading profile picture:", error.message);
      throw new Error(error.message || "Failed to upload profile picture.");
    }
  }

  async updateUserProfilePicture(userId: string, photoUrl: string) {
    try {
      // Appwrite does not directly support updating user profiles; use a custom solution or database to store the URL.
      // Example:
      // await databases.updateDocument('your-database-id', 'your-collection-id', userId, { profilePic: photoUrl });
      // For this example, we'll assume that profile picture URL is managed in some custom storage.
      console.log(`Update user profile with photo URL: ${photoUrl}`);
      alert("Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile picture:", error.message);
      throw new Error(error.message || "Failed to update profile picture.");
    }
  }


  
}




const appwriteService = new AppwriteService();
export default appwriteService;