// const express = require("express");
// const multer = require("multer");
// const ffmpeg = require("fluent-ffmpeg");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");

// const app = express();
// const upload = multer({ dest: "uploads/" });
// app.use(cors());
// app.use(express.static("public"));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.post(
//   "/upload",
//   upload.fields([{ name: "image" }, { name: "audio" }]),
//   (req, res) => {
//     const image = req.files.image[0];
//     const audio = req.files.audio[0];
//     const outputVideo = `uploads/Generated_vid.mp4`;

//     ffmpeg()
//       .input(image.path)
//       .inputOption("-loop 1") // Loop the image
//       .input(audio.path)
//       .videoCodec("libx264") // Use H.264 video codec
//       .audioCodec("aac") // Use AAC audio codec
//       .outputOptions("-pix_fmt yuv420p") // Ensure compatibility with most players
//       .outputOptions("-shortest") // Make the video as short as the shortest input (audio in this case)
//       .save(outputVideo)
//       .on("end", () => {
//         // Clean up the uploaded files
//         fs.unlinkSync(image.path);
//         fs.unlinkSync(audio.path);

//         res.json({ videoUrl: `/${outputVideo}` });
//       })
//       .on("error", (err) => {
//         console.error(err);
//         res.status(500).send("Error creating video");
//       });
//   }
// );

// app.listen(3002, () => {
//   console.log("Server is running on http://localhost:3002");
// });

const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post(
  "/upload",
  upload.fields([{ name: "image" }, { name: "audio" }]),
  (req, res) => {
    const image = req.files.image[0];
    const audio = req.files.audio[0];
    const outputVideo = `uploads/Generated_vid.mp4`;

    ffmpeg()
      .input(image.path)
      .inputOption("-loop 1") // Loop the image
      .input(audio.path)
      .videoCodec("libx264") // Use H.264 video codec
      .audioCodec("aac") // Use AAC audio codec
      .outputOptions("-pix_fmt yuv420p") // Ensure compatibility with most players
      .outputOptions("-shortest") // Make the video as short as the shortest input (audio in this case)
      .save(outputVideo)
      .on("end", () => {
        // Clean up the uploaded files
        fs.unlinkSync(image.path);
        fs.unlinkSync(audio.path);

        // Read the generated video file
        fs.readFile(outputVideo, (err, data) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error reading video file");
            return;
          }
          // Set appropriate headers
          res.setHeader("Content-Type", "video/mp4");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="Generated_vid.mp4"`
          );
          // Send the video data as response
          res.send(data);
        });
      })
      .on("error", (err) => {
        console.error(err);
        res.status(500).send("Error creating video");
      });
  }
);

app.listen(3002, () => {
  console.log("Server is running on http://localhost:3002");
});
