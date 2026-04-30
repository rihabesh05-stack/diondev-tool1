require('dotenv').config();

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Remove.bg API endpoint
app.post('/remove-bg', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const apiKey = process.env.REMOVE_BG_API_KEY; // Set your API key in environment variables

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(imagePath));
    formData.append('size', 'auto');

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        'X-Api-Key': apiKey,
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer'
    });

    // Send the processed image back
    res.set('Content-Type', 'image/png');
    res.send(response.data);

    // Clean up uploaded file
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});