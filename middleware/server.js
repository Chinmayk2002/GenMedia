const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

// Route to handle API requests
app.post("/api/forwardRequest", async (req, res) => {
  try {
    // Forward the request to the external endpoint
    const response = await axios.post(
      "https://597d963f2f0b185743.gradio.live/sdapi/v1/txt2img",
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error("Failed to forward request:", error);
    res.status(500).json({ error: "Failed to forward request" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
