const { Router } = require("express");
const router = Router();
const User = require("../models/user");

// Home page
router.get("/", (req, res) => {
    return res.render("home");
});

// Signup page
router.get("/signup", (req, res) => {
    return res.render("partials/signup");
});

// Signin page
router.get("/signin", (req, res) => {
    return res.render("partials/signin");
});

// Signin form submit
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const token = await User.matchPasswordAndGenerateToken(
            email,
            password
        );

        return res.cookie("token", token).redirect("/");
    } catch (error) {
        console.log(error.message);

        return res.status(401).render("partials/signin", {
            error: "Invalid email or password"
        });
    }
});

// Signup form submit
router.post("/signup", async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        await User.create({
            fullName,
            email,
            password
        });

        return res.redirect("/users/signin");
    } catch (error) {
        console.log(error.message);

        return res.status(400).render("partials/signup", {
            error: error.message
        });
    }
});
// logout button
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    return res.redirect("/");
});
module.exports = router;