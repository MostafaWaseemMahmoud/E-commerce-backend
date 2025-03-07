import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import AdministratorDashBoard from "./routers/AdminDashBoard/tasks.js";
import UserDashBoard from "./routers/UserRoute/user.js"
import OrderDashBoard from "./routers/OrderRoute/order.js";
import mailer  from './services/mailer.js'
import Payment from './routers/payment/payment.js'
const app = express();
const PORT = process.env.PORT || 3300;

// 🟢 Middleware
app.use(cors());
app.use(express.json()); // This MUST come before routes!

// 🟢 Routes
app.use("/admindashboard", AdministratorDashBoard);
app.use("/user", UserDashBoard);
app.use("/manageorder", OrderDashBoard);
app.use("/payment", Payment);

app.get("/", (req, res) => {
  res.status(200).send("✅ Server is working correctly!");
});

app.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Recipient email is missing!" });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    mailer("mostafawaseem22@gmail.com",email,'lumeo OTP Code' , `<h1>YOur OTP Code Is ${otp}</h1>`)
    return res.status(200).json({ otp: otp });
});

mongoose.connect('mongodb+srv://mostafawaseem22:kMJGcFvSWoKr5eNb@1.vgxdq.mongodb.net/?retryWrites=true&w=majority&appName=1').then(()=>{
    console.warn(")=  DataBase Connected Succ ?!  =(");
}).then(()=> {
    app.listen(PORT, function(err){
        if (err) console.log("Error in server setup")
        console.error("Server listening on Port", PORT);
    })
}).catch((e)=> {
    console.error("Error While Connecting to the Database?," ,e)  
})