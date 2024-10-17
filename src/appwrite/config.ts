import { Client, Account, Databases, ID, OAuthProvider, Storage } from "appwrite";
import { v4 as uuidv4 } from 'uuid';

export const API_ENDPOINT = 'https://cloud.appwrite.io/v1';
export const PROJECT_ID = '66d94ffb0025a8aa0b9d';
export const BUCKET_ID = '66eb0cfc000e821db4d9';
export const DATABASE_ID = '66ebe85b002fb4aab493';
export const STARTUP_ID = '6704bbd6003c907e60dc';
export const PROJECTS_ID = '67077994001c72cd4b42';

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
const storageClient = new Storage(appwriteClient);
export const databases = new Databases(appwriteClient);


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
      const user = await account.get();
      return user;
    } catch (error) {
      console.log("getCurrentUser error: " + error);
    }
  
    return null;
  }
  



  async loginWithGoogle(successRedirectUrl: string, failureRedirectUrl: string) {
    try {
      await account.createOAuth2Session(OAuthProvider.Google, "http://localhost:3000/home", "http://localhost:3000/");
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


  async uploadFile(file: File) {
    try {
      const fileId = uuidv4(); // Generate a unique ID for the file
      const response = await storageClient.createFile(BUCKET_ID, fileId, file);
      return response;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async updateUserProfilePicture(userId: string, photoUrl: string) {
    try {
        // Appwrite doesn't support direct user profile updates, so using preferences to store the photo URL
        await account.updatePrefs({
            profilePic: photoUrl
        });
        console.log('Profile picture URL updated in user preferences');
      alert("Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile picture:", error.message);
      throw new Error(error.message || "Failed to update profile picture.");
    }
  }

  async updateUserDetails(name: string, email: string, password: string) {
    try {
      await account.updateEmail(email, password); 
      await account.updatePrefs({ name }); 
      alert("User details updated successfully!");
    } catch (error: any) {
      console.error("Error updating user details:", error.message);
      throw new Error(error.message || "Failed to update user details.");
    }
  }
  
  


  
}




const appwriteService = new AppwriteService();
export default appwriteService;