import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username:{type:String,required:true,unique: true,},
    email: { type: String, required: true },
    password:{type:String, required:true},
    avatar: { type: String},
    isVerified: { type: Boolean, default: false }, // New field for email verification
    emailToken: { type: String }, // New field for email verification token
    allresponses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Res" }],

});

const User = mongoose.model("User", UserSchema);

export default User;