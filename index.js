const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const Blog = require("./models/blog");

const {
    checkForAuthenticationCookie
} = require("./middlewares/authentication");

const app = express();
const PORT = 8002;

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/blog-space")
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((err) => {
        console.log("MongoDB Error:", err.message);
    });

// EJS Configuration
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Authentication
app.use(checkForAuthenticationCookie("token"));

// Make user available in all EJS pages
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use("/users", userRoutes);
app.use("/blog", blogRoutes);
app.use(express.static(path.resolve('./public')))
// Home Page
app.get("/", async (req, res) => {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
    return res.render("home",{
        user:  req.user,
        blog: allBlogs
    });

});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is started at: ${PORT}`);
});