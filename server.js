import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


const registerSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  lastLogin:{
    type:Date,
    default:null
  }
},{timestamps:true});

const loginSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const Login =
  mongoose.models.Login ||
  mongoose.model("Login", loginSchema);

const Register =
  mongoose.models.Register ||
  mongoose.model("Register", registerSchema);
  // Fetch Dashboard Statistics
app.get("/api/dashboard-stats", async (req, res) => {

  try {

    // 1. Total Registered Users
    const totalUsers = await Register.countDocuments();


    // 2. Active Users (Last 30 Days)
    const activeSince = new Date();

    activeSince.setDate(activeSince.getDate() - 30);

    const activeUsers = await Register.countDocuments({
      lastLogin: { $gte: activeSince }
    });


    // 3. New Users (Last 7 Days)
    const newSince = new Date();

    newSince.setDate(newSince.getDate() - 7);

    const newUsers = await Register.countDocuments({
      createdAt: { $gte: newSince }
    });


    // 4. Inactive Users
    const inactiveUsers = totalUsers - activeUsers;


    // 5. Recent Registrations (Latest 5 Users)
    const recentRegistrations = await Register.find()
      .select("name email username createdAt")
      .sort({ createdAt: -1 })
      .limit(5);


    // Send all statistics to React
    res.status(200).json({

      totalUsers,
      activeUsers,
      newUsers,
      inactiveUsers,
      recentRegistrations

    });

  } catch (error) {

    console.error("Dashboard statistics error:", error);

    res.status(500).json({
      message: "Unable to fetch dashboard statistics"
    });

  }

});

// Fetch registered users for Dashboard
app.get("/api/users", async (req, res) => {
  try {
    const users = await Register.find()
      .select("name email username password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);

    res.status(500).json({
      message: "Unable to fetch registered users"
    });
  }
});



// Fetch one user's details for the edit popup
app.get("/api/users/:id/edit", async (req, res) => {
  try {
    const user = await Register.findById(req.params.id)
      .select("name email username password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user for editing:", error);

    res.status(500).json({
      message: "Unable to fetch user details"
    });
  }
});



// Update a registered user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !username?.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill all the fields."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[$%@!&*?#]/.test(password)
    ) {
      return res.status(400).json({
        message: "Please enter a valid strong password."
      });
    }

    // Check whether another user already has this email
    const existingUser = await Register.findOne({
      email: normalizedEmail,
      _id: { $ne: req.params.id }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email ID is already registered."
      });
    }

    const user = await Register.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        email: normalizedEmail,
        username: username.trim(),
        password
      },
      {
        new: true,
        runValidators: true
      }
    ).select("name email username password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.error("Error updating user:", error);

    return res.status(500).json({
      message: "Unable to update user"
    });
  }
});



// Delete a registered user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await Register.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    res.status(500).json({
      message: "Unable to delete user"
    });
  }
});


app.post("/api/check-email", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email || "")) {
      return res.status(400).json({
        exists: false,
        message: "Please enter a valid email address."
      });
    }

    // Check MongoDB for an existing email
    const existingUser = await Register.findOne({
      email: email
    });

    if (existingUser) {
      return res.status(409).json({
        exists: true,
        message: "This email ID is already registered. Go to Login."
      });
    }

    // Important: respond when the email is available
    return res.status(200).json({
      exists: false,
      message: "Email is available."
    });

  } catch (error) {
    console.error("Email checking error:", error);

    return res.status(500).json({
      message: "Error checking email."
    });
  }
});


app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login data received:", req.body);


    const registeredUser = await Register.findOne({ email });

    console.log(registeredUser, "data")

    if (!registeredUser) {
      return res.status(401).json({
        message: "User is not registered. Please register first."
      });
    }


    const isPasswordCorrect = await bcrypt.compare(
      password,
      registeredUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Incorrect password."
      });
    }
    // Update the user's last login date
    registeredUser.lastLogin = new Date();

    await registeredUser.save();
  

    // await login.save();

    console.log("Login successful and data saved");

    res.status(200).json({
      message: "Login successfully",
    });

  } catch (error) {
    console.log("Login error:", error);

    res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !username?.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill all the fields."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    // Check whether the email is already registered
    const existingUser = await Register.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email ID is already registered. Go to Login."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const register = new Register({
      name: name.trim(),
      email: normalizedEmail,
      username: username.trim(),
      password: hashedPassword
    });

    await register.save();

    console.log("Registration saved successfully");

    return res.status(201).json({
      message: "Registration successful!"
    });

  } catch (error) {
    console.log("Registration error:", error);

    return res.status(500).json({
      message: "Error saving registration."
    });
  }
});


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(5000, () => {
      console.log("Server running on https://simple-login-server-nda4.onrender.com");
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });