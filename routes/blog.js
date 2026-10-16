const { resolve } = require("dns");
const {Router} = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/user");
const Comment = require("../models/comments");
const Blog = require("../models/blog");
const fs = require("fs");





const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve(
      `./public/uploads/${req.user._id}`
    );

    // Folder create karo agar pehle se nahi hai
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage })

router.get("/add-new",(req, res) =>{
    return res.render("partials/addBlog", {
        user: req.user,
    });
});

router.get("/add-new", (req, res) => {
    return res.render("partials/addBlog", {
        user: req.user,
    });
});

router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate("createdBy");

        if (!blog) {
            return res.status(404).send("Blog not found");
        }

        // Blog comments fetch here
        const comments = await Comment.find({
            blogId: blog._id
        }).populate("createdBy");

        return res.render("partials/blog", {
            user: req.user,
            blog,
            comments
        });

    } catch (error) {
        console.error("Get Blog Error:", error);
        return res.status(500).send("Error loading blog");
    }
});

// Handle Blog Form Submission
router.post("/", upload.single("coverImage"), async(req, res) => {
    const {title, body} = req.body;
    const blog= await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.user._id}/${req.file.filename}`
    })
    console.log("Blog Form Data:", req.body);
    console.log("Uploaded Image:", req.file);

    return res.redirect(`/blog/${blog._id}`);
});





// Comment Post Route
router.post("/:id/comments", async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/users/signin");
        }

        const comment = await Comment.create({
            content: req.body.content,
            blogId: req.params.id,
            createdBy: req.user._id
        });

        return res.redirect(`/blog/${req.params.id}`);

    } catch (error) {
        console.error("Comment Error:", error);
        return res.status(500).send("Failed to post comment");
    }
});


module.exports= router;