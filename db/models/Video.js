import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  name: String,
  path: String,
  processingResult: mongoose.Schema.Types.Mixed,
});


const Video = mongoose.model("Video", videoSchema);

export default Video;