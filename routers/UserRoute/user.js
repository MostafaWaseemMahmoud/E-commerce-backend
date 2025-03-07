import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";
import UserSchema from '../../model/user.model.js';
import mailer from '../../services/mailer.js';
const Router = express.Router();

cloudinary.config({
  cloud_name: 'dzalji6cp',
  api_key: '984822474922137',
  api_secret: "5hFN35zB75V6Kznf-g9W8lSDdRU",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "uploads",
    format: async (req, file) => "png", // You can set the format dynamically
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`,
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

class UserDashboard {
    async add(name, email, password) {
        try {
          if (!name || !email || !password) {
            return { status: 404, message: "Missing Required Fields" };
          }
      
          const newUser = new UserSchema({
            name, email, password,watchingList: []
          });
      
          await newUser.save();
      
          // Attractive Email Template
          mailer(
            'mostafawaseem22@gmail.com',
            email,
            "Welcome To Our Application",
            `
            <div style="max-width:600px; margin:auto; padding:20px; background-color:#f9f9f9; border:1px solid #e0e0e0; border-radius:8px; font-family:Arial, sans-serif;">
              <h1 style="text-align:center; color:#333;">Welcome to Lumeo!</h1>
              <div style="display:flex; flex-direction:column; align-items:center; margin:20px 0;">
                <h2 style="color:#555;">Hello, ${name}!</h2>
              </div>
              <p style="font-size:16px; color:#666; text-align:center;">
                We're excited to have you join our community. Explore our features and enjoy your experience!
              </p>
              </div>
            </div>
            `
          );
      
          return { status: 200, message: newUser };
        } catch (error) {
          return { status: 500, message: "Error While Adding User: " + error };
        }
    }
    async findOne(  id) {
        const FoundUser = await UserSchema.findById(id);

        if (!FoundUser) {
            return { status: 404, message: "No User found" };
        }
        return { status: 200, message: FoundUser };
    }
    async GetAll(authHeader) {
        if (!authHeader) {
            return { status: 404, message: "Invalid token" };
        }
    
        const token = authHeader; // Extract token
    
        if (token !== "lkjfdafdsalkjfdalkfdlkjafdas") {
            return { status: 404, message: "Invalid token" };
        }
    

        const FoundUsers = await UserSchema.find();

        if (!FoundUsers) {
            return { status: 404, message: "No User found" };
        }
        return { status: 200, message: FoundUsers };
    }

    async update(authHeader, id, updatedData) {
        if (!authHeader) {
            return { status: 404, message: "Invalid token" };
        }
    
        const token = authHeader; // Extract token
    
        if (token !== "lkjfdafdsalkjfdalkfdlkjafdas") {
            return { status: 404, message: "Invalid token" };
        }
    
        try {
            const updatedUser = await UserSchema.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
    
            if (!updatedUser) {
                return { status: 404, message: "User not found" };
            }
    
            return { status: 200, message: "User updated successfully", user: updatedUser };
        } catch (error) {
            return { status: 500, message: "Error updating user: " + error };
          }
        }
        
        async addProductToWatchingList (userId,productId) {
          const FoundUser = await UserSchema.findById(userId);
          FoundUser.watchingList.push(productId);
          FoundUser.save()
          return { status: 200, message: "Watch List Added Successfully" };
    }

    async RemoveProductFromWatchingList(userId, productId) {
      try {
        const FoundUser = await UserSchema.findById(userId);
        if (!FoundUser) {
          return { status: 404, message: "User not found" };
        }
    
        const watchingList = FoundUser.watchingList;
        
        // Check if product exists in the list
        const productIndex = watchingList.indexOf(productId);
        
        if (productIndex === -1) {
          return { status: 404, message: "Product not found in watching list" };
        }
    
        // Remove the product from the list
        watchingList.splice(productIndex, 1);
    
        // Save the updated user document
        await FoundUser.save();
    
        return { status: 200, message: "Product removed from watching list" };
    
      } catch (error) {
        return { status: 500, message: "Error while removing product: " + error };
      }
    }
    
}

const userdashboard = new UserDashboard();

Router.post("/add",async(req,res)=> {
    const {name,email,password} = req.body;
    const result = await userdashboard.add(name,email,password);
    res.status(result.status).json(result.message);
    console.log(`%c(${result.status}) %cMessage: ${result.message}`,"color:green","color:red");
})

Router.get("/findone/:id", async (req, res) => {
    try {
      const {id} = req.params;
  
      const result = await userdashboard.findOne(id);
  
      res.status(result.status).json({ message: result.message });
      console.log(`Status: ${result.status}, Message: ${result.message}`);
  
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error: " + error });
    }
  });
Router.get("/all", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
  
      const result = await userdashboard.GetAll(authHeader);
  
      res.status(result.status).json({ message: result.message });
      console.log(`Status: ${result.status}, Message: ${result.message}`);
  
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error: " + error });
    }
  });
Router.get("/update/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const id = req.params 
      const {name} = req.body;
      const updatedData = {
        name
      }
      const result = await userdashboard.update(authHeader,id,updatedData);
  
      res.status(result.status).json({ message: result.message });
      console.log(`Status: ${result.status}, Message: ${result.message}`);
  
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error: " + error });
    }
  });
Router.post("/addwacthinglist/:userId/:productId", async (req, res) => {
    try {
      const {userId,productId} = req.params 

      const result = await userdashboard.addProductToWatchingList(userId,productId);
  
      res.status(result.status).json({ message: result.message });
      console.log(`Status: ${result.status}, Message: ${result.message}`);
  
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error: " + error });
    }
  });
Router.post("/deletewatchinglist/:userId/:productId", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const {userId,productId} = req.params 

      const result = await userdashboard.addProductToWatchingList(userId,productId);
  
      res.status(result.status).json({ message: result.message });
      console.log(`Status: ${result.status}, Message: ${result.message}`);
  
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error: " + error });
    }
  });


export default Router;