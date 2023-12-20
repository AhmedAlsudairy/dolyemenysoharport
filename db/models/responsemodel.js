import mongoose from "mongoose";

const ResSchema = new mongoose.Schema({
    urllink: { type: String, required: true },
    summary: { type: String, required: true },
   
    createdAt: { type: String}, 
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const ResModel = mongoose.model("Res", ResSchema);

export default ResModel;