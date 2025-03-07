import express from "express";
import ProductSchema from "../../model/product.model.js"; // Import your Product model
const Router = express.Router();
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";

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

class ManageProducts {
  async add(name, description, price, category, stock, image) {

    if(!name || !description || !price || !category || !stock || !image){
      return { status: 404, message: "Missing Required Fields" };
    }
    try {
      const product = new ProductSchema({
        name,
        description,
        price,
        category,
        stock,
        image
      });


      await product.save();
      return { status: 200, message: "Product Added Successfully" };

    } catch (e) {
      return { status: 500, message: "Error While Adding Product: " + e };
    }
  }
  async AllProducts() {
    try {
      const AllProducts = await ProductSchema.find(); 
      return { status: 200, message: AllProducts };

    } catch (e) {
      return { status: 500, message: "Error While Getting All Products: " + e };
    }
  }
  async RemoveProduct(id,authHeader) {
    try {

        if (!authHeader) {
            return { status: 404, message: "Invalid token" };
        }
    
        const token = authHeader; // Extract token
    
        if (token !== "lkjfdafdsalkjfdalkfdlkjafdas") {
            return { status: 404, message: "Invalid token" };
        }
    

        const deletedProduct = await ProductSchema.findByIdAndDelete(id);

        if (!deletedProduct) {
            return { status: 404, message: "Product not found" };
        }

      return { status: 200, message: "Product Removed Successfully" };

    } catch (e) {
      return { status: 500, message: "Error While Remove A Product: " + e };
    }
  }

  async GetOneProduct(id) {
    try {
        const FoundProduct = await ProductSchema.findById(id);

        if (!FoundProduct) {
            return { status: 404, message: "Product not found" };
        }

      return { status: 200, message: FoundProduct };

    } catch (e) {
      return { status: 500, message: "Error While Finding A Product: " + e };
    }
  }
}

let admindashboard = new ManageProducts();

Router.post("/addproduct", upload.single('image'), async (req, res) => {
  try {
    const image = req.file ? req.file.path : 'https://example.com/default-profile-pic.jpg';
    const { name, description, price, category, stock } = req.body;

    const result = await admindashboard.add(name, description, price, category, stock, image);

    res.status(result.status).json({ message: result.message });
    console.log(`Status: ${result.status}, Message: ${result.message}`);

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error: " + error });
  }
});

Router.get("/getallproducts", async (req, res) => {
  try {
    const result = await admindashboard.AllProducts();

    res.status(result.status).json({ message: result.message });
    console.log(`Status: ${result.status}, Message: ${result.message}`);

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error: " + error });
  }
});

Router.delete("/removeproduct/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const id = req.params.id;

    const result = await admindashboard.RemoveProduct(id,authHeader);

    res.status(result.status).json({ message: result.message });
    console.log(`Status: ${result.status}, Message: ${result.message}`);

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error: " + error });
  }
});
Router.get("/getoneproduct/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await admindashboard.GetOneProduct(id);

    res.status(result.status).json({ message: result.message });
    console.log(`Status: ${result.status}, Message: ${result.message}`);

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error: " + error });
  }
});

export default Router;
