import express from "express";
import * as dotenv from "dotenv"
import cors from 'cors'
import fileUpload from 'express-fileupload';
import { spawn } from 'child_process';
import connectDB from './db/connect.js';
import authRoute from './routes/auth.js'
import userRoute from './routes/UserRoute.js'
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';


import Video from './db/models/Video.js';

dotenv.config()

const app = express();
app.use(fileUpload({
  createParentPath: true
}))
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


app.use(cors())
app.use(express.json({limit:'50mb'}))
app.use("/api/v1/auth",authRoute)
app.use("/api/v1/users",userRoute)

app.post('/api/v1/upload_video', async (req, res) => {
  if (!req.files || !req.files.video) {
    return res.status(400).send('No video file uploaded.');
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const videoFile = req.files.video;
  const videoPath = path.join(__dirname, '/uploads/', videoFile.name);
  const resultPath = path.join(__dirname, '/results/');
  const modelPath = path.join(__dirname, '/objmodel/best.pt');

  videoFile.mv(videoPath, async (err) => {
    if (err) return res.status(500).send(err);

    const pythonProcess = spawn('python', ['main.py', videoPath, resultPath, modelPath]);

    let scriptOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      console.log(`child process exited with code ${code}`);

      if (code !== 0) {
        return res.status(500).send('Error processing video.');
      }

      try {
        // Log the script output for debugging
        console.log("Python Script Output:", scriptOutput);

        const cloudinaryResponse = await cloudinary.v2.uploader.upload(videoPath, {
          resource_type: 'video'
        });

        // Assuming scriptOutput is JSON. Parse it if necessary.
        // If it's not JSON, adjust accordingly.
        let processingResult;
        try {
          processingResult = JSON.parse(scriptOutput);
        } catch (parseError) {
          console.error('Error parsing script output:', parseError);
          processingResult = {}; // or handle as appropriate
        }

        const video = new Video({
          name: videoFile.name,
          path: cloudinaryResponse.secure_url,
          processingResult: processingResult
        });

        await video.save();

        return res.send({
          message: 'Video uploaded to Cloudinary and processed successfully.',
          data: processingResult,
          cloudinaryUrl: cloudinaryResponse.secure_url
        });
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).send('Error uploading video to Cloudinary.');
      }
    });
  });
});

app.get('/',(req,res)=>{
res.send({message:'Hello world'})
})

const serverstart= async ()=>{
try {

connectDB(process.env.MONGODB_URI)  
app.listen(8080, () =>
console.log("Server started on port http://localhost:8080"),
);
} catch (error) {
   console.log(error) 
}



}

serverstart();
