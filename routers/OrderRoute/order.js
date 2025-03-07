import express from 'express';
import OrderSchema from '../../model/order.model.js';
import ProductSchema from "../../model/product.model.js";
const Router = express.Router();

class OrderDashboard {
    async add(userId, item, totalPrice, status) {
      try {
        if (!userId || !item || !totalPrice || !status) {
          return { status: 400, message: "Missing Required Fields" };
        }
  
        const newOrder = new OrderSchema({
          userId,
          item,
          totalPrice,
          status
        });
  
        await newOrder.save();
        return { status: 200, message: "Order Added Successfully", order: newOrder };
  
      } catch (error) {
        return { status: 500, message: `Error While Adding Order: ${error}` };
      }
    }
    async buyOrder(orderId) {
        try {
          if (!orderId) {
            return { status: 400, message: "Missing Required Params" };
          }
      
          // Fetch the order
          const FoundOrder = await OrderSchema.findById(orderId);
          if (!FoundOrder) {
            return { status: 404, message: "Order not found" };
        }
        
        if(FoundOrder.status ===  "bought"){
            return { status: 200, message: "The Order has Already Cashed" };
          }
      
          // Fetch the product
          const Product = await ProductSchema.findById(FoundOrder.item.productId);
          if (!Product) {
            return { status: 404, message: "Product not found" };
          }
          
      
          // Update order status and decrease product stock
          FoundOrder.status = "bought";
          if (Product.stock > 0) {
            Product.stock--;
          } else {
            return { status: 400, message: "Product is out of stock" };
          }
      
          // Save both updates
          await Product.save();
          await FoundOrder.save();
      
          return { status: 200, message: "Order bought successfully" };
      
        } catch (error) {
          return { status: 500, message: `Error While Processing Order: ${error}` };
        }
      }
  }
  
  let orderdashboard = new OrderDashboard();
  
  Router.post("/addorder", async (req, res) => {
    try {
      const { userId, itemId} = req.body;
  
      // Find the product
      const foundProduct = await ProductSchema.findById(itemId);
      if (!foundProduct) {
        return res.status(404).json({ message: "Can't Find Any Product With That Id" });
      }
  
      // Prepare the item
      const item = {
        productId: itemId,
        price: foundProduct.price
      };
  
      // Calculate total price
      let totalPrice = foundProduct.price;
      let status = "waiting";
  
      // Add order
      const result = await orderdashboard.add(userId, item, totalPrice, status);
      console.log(`Status: ${result.status} With Message: ${result.message}`);
  
      res.status(result.status).json(result);
  
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error: " + error });
    }
  });
  Router.post("/cashorder/:id", async (req, res) => {
    try {
      const itemId = req.params.id;
  
      const foundOrder = await OrderSchema.findById(itemId);
      if (!foundOrder) {
        return res.status(404).json({ message: "Can't Find Any Order With That Id" });
      }
  
      // Await the buyOrder function
      const result = await orderdashboard.buyOrder(itemId);
  
      console.log(`Status: ${result.status} With Message: ${result.message}`);
      res.status(result.status).json(result);
  
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error: " + error });
    }
  });
  Router.post("/allorders",async (req,res)=> {
    try {
        const ALlOrders = await OrderSchema.find();
        res.status(200).json({ message: ALlOrders});
      }catch(e) {
          res.status(500).json({ message: "Error While Get All Users"});
      }
  })
  
  
  export default Router;
  