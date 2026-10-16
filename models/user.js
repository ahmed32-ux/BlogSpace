const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { createTokenForUser, validateToken} = require("../services/authentication")

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Before Signup password hashed
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Email & password verify
userSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
    const user = await this.findOne({ email });

    if (!user) {throw new Error("Invalid email or password");}
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { throw new Error("Invalid email or password");}

    const token = createTokenForUser(user);
    return token;
};


const User = mongoose.model("User", userSchema);

module.exports = User;


