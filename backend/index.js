require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");

const { authenticateToken } = require("./utilities");

const User = require("./models/user.model");
const TravelPlan = require("./models/travelPlan.model");

mongoose.connect(config.connectionString);

const app = express();
app.use(express.json());
app.use(cors({origin:"*"}));

/// Create Account
app.post("/create-account", async (req,res)=> {
    const { fullName, email, password} = req.body;

    if(!fullName|| !email || !password) {
        return res
        .status(400)
        .json({error: true, message:"All fields are required"});
    }

    const isUser = await User.findOne({email});
    if (isUser) {
        return res
        .status(400)
        .json({error:true,message:"User already exist"})
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        fullName,
        email,
        password: hashedPassword,
    });

    await user.save();

    const accessToken = jwt.sign(
        {userId:user._id},
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"72h"
        }
    );


    return res.status(201).json({
        error:false,
        user:{ fullName: user.fullName, email: user.email},
        accessToken,
        message:"Registration Successful",
    });

});

// Login 
app.post("/login", async (req,res)=> {
    const {email, password} = req.body;

    if(!email|| !password){
        return res.status(400).json({message: "Email and Password are Required"});
    }

    const user = await User.findOne({email});
    if (!user) {
        return res.status(400).json({message: "User Not Found"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid){
        return res.status(400).json({message:"Invalid Credentials"});
    }

    const accessToken = jwt.sign(
        {userId:user._id},
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"72h"
        }
    );

    return res.json({
        error:false,
        message:"Login Successful",
        user:{ fullName: user.fullName, email: user.email},
        accessToken,
    });
});

// Get User
app.get("/get-user", authenticateToken, async (req,res)=> {
    const {userId} = req.user

    const isUser = await User.findOne({_id: userId});

    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: isUser,
        message: "",
    });
});

// Route to handle Image upload
app.post("/image-upload", upload.single("image"), async (req,res)=> {
    try{
    if(!req.file){
        return res
        .status(400)
        .json({error: true, message: "No Image Uploaded"});
    }
        
        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;

        res.status(201).json({imageUrl});
    } catch(error) {
        res.status(500).json({error:true, message: error.message});
    }
});

// Delete an Image from the Upload Folder
app.delete("/delete-image", async (req,res)=> {
    const{imageUrl} = req.query;


    if (!imageUrl){
        return res
        .status(400)
        .json({error:true,message:"ImageUrl parameter is required"});
    }


    try {
        // Extract the filename from the imageUrl
        const filename = path.basename(imageUrl);

        // Define the file path
        const filePath = path.join(__dirname, 'uploads', filename);

        // Check if the file exists
        if (fs.existsSync(filePath)) {
            // Delete the file from uploads folder
            fs.unlinkSync(filePath);
            res.status(200).json({message:"Image deleted successfully"});
        } else {
            res.status(200).json({error:true, message: "Image not found"})
        }
    } catch (error) {
        res.status(500).json({error:true, message:error.message});
    }
});

// Serve Static files from the upload and assets directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Add Travel Plans
app.post("/add-travel-plan", authenticateToken, async (req,res)=> {
    const {title,plan, plannedLocation,imageUrl,plannedDate} = req.body;
    const {userId}= req.user;

    // Validate required fields
    if (!title ||!plan ||!plannedLocation ||!imageUrl ||!plannedDate){
        return res.status(400).json({error:true, message: "All fields are required"});

    }


    // Convert plannedDate from milliseconds to Date Object
    const parsedPlannedDate = new Date(parseInt(plannedDate));
    try{
        const travelPlan = new TravelPlan({
            title,
            plan,
            plannedLocation,
            userId,
            imageUrl,
            plannedDate: parsedPlannedDate,
        });
        
        await travelPlan.save();
        res.status(201).json({plan: travelPlan, message:'Added Successfully'});
    } catch (error) {
        res.status(400).json({error: true, message: error.message});
    }



});

// Get All Travel Plans
app.get("/get-all-plans", authenticateToken, async (req,res)=> {
    const {userId} = req.user;

    try {
        const travelPlans = await TravelPlan.find({userId: userId}).sort({
            isFavorite: -1 ,
        });
        res.status(200).json({plans:travelPlans});
    } catch (error) {
        res.status(500).json({error: true, message: error.message});
    }


});

// Edit Travel Plan
app.put("/edit-plan/:id", authenticateToken, async (req,res)=> {
    const { id } = req.params;
    const { title,plan,plannedLocation,imageUrl,plannedDate} = req.body;
    const { userId } = req.user;

    // Validate required fields
    if (!title || !plan || !plannedLocation  || !plannedDate ) {
        return res
        .status(400)
        .json({ error: true, message: "All fields are required"});
    } 

    // Convert plannedDate from milliseconds to Date object
    const parsedPlannedDate = new Date(parseInt(plannedDate));

    try{
        // Find the travel plan by ID and ensure 
        const travelPlan = await TravelPlan.findOne({_id: id, userId: userId});

        if (!travelPlan) {
            return res.status(404).json({error:true, message:"Travel Plan not found"});
        }

        const placeholderimgurl = 'http://localhost:8000/assets/placeholder.png'

        travelPlan.title = title;
        travelPlan.plan = plan;
        travelPlan.plannedLocation = plannedLocation;
        travelPlan.imageUrl = imageUrl || placeholderimgurl;
        travelPlan.plannedDate = parsedPlannedDate;

        await travelPlan.save();
        res.status(200).json({plan:travelPlan, message:"Update Successful"});
    } catch (error) {
        res.status(500).json({error: true, message: error.message});
    }


});

// Delete a travel Plan
app.delete("/delete-plan/:id", authenticateToken, async (req,res)=> {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        // Find the travel plan by ID and ensure 
        const travelPlan = await TravelPlan.findOne({_id: id, userId: userId});

        if (!travelPlan) {
            return res.status(404).json({error:true, message:"Travel Plan not found"});
        }

        // Delete the travel plan from the Database
        await travelPlan.deleteOne({_id: id, userId:userId});

        // Extract the filename from the imageurl
        const imageUrl = travelPlan.imageUrl;
        const filename = path.basename(imageUrl);

        // Define the file path
        const filePath = path.join(__dirname, 'uploads',filename);

        // Delete the image file from the uploads folder
        fs.unlink(filePath, (err) => {
            if (err) {
            console.error("Failed to delete Image file:", err);            
            }
        });


        res.status(200).json({message: "Travel plan deleted successfully"});
    } catch (error) {
        res.status(500).json({error: true, message: error.message});
    }
});


// Update isFavorite
app.put("/update-is-favorite/:id", authenticateToken, async (req,res)=> {
    const { id } = req.params;
    const { isFavorite} = req.body;
    const { userId } = req.user;

    try{
        // Find the travel plan by ID and ensure 
        const travelPlan = await TravelPlan.findOne({_id: id, userId: userId});

        if (!travelPlan) {
            return res.status(404).json({error:true, message:"Travel Plan not found"});
        }

        travelPlan.isFavorite = isFavorite;

        await travelPlan.save();
        res.status(200).json({plan :travelPlan, message: "Update successful"});
    } catch (error) {
        res.status(500).json({error: true, message: error.message});
    }
});


// Search Travel stories
app.get("/search", authenticateToken, async (req,res)=> {
    const { query } = req.query;
    const { userId } = req.user;

    if (!query) {
        return res.status(404).json({error:true, message:"query is required"});
    }

    try {
        const searchResults = await TravelPlan.find({
            userId: userId,
            $or: [
                {title: {$regex: query, $options: "i"}},
                {plan: {$regex: query, $options: "i"}},
                {plannedLocation: {$regex: query, $options: "i"}},
            ],
        }).sort({ isFavorite: -1});

        res.status(200).json({plans: searchResults});
    } catch (error) {
        res.status(500).json({error: true, message: error.message});
    }
});


// Filter travel plans by date range
app.get("/travel-plans/filter", authenticateToken, async (req,res) => {
    const { startDate, endDate } = req.query;
    const { userId } = req.user;

    try{
        // Convert startDate and endDate from miliseconds to Date Objects
        const start = new Date(parseInt(startDate));
        const end = new Date(parseInt(endDate));

        // Find travel stories that belong to the authenticated user and fall within the date range
        const filteredPlans = await TravelPlan.find({
            userId: userId,
            plannedDate: { $gte: start, $lte: end},
        }).sort({ isFavorite:-1});

        res.status(200).json({plans: filteredPlans});
    } catch (error) {
        res.status(500).json({ error: true, message: error.message});
    }
});


app.listen(8000);
module.exports = app;