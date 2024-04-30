// Load environment variables from .env file
require('dotenv').config();

// Import necessary packages
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { createCipheriv, createDecipheriv, randomBytes } = require('crypto');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load Swagger API documentation
swaggerDocument = YAML.load('./swagger.yaml');

// Initialize Express application and Prisma client
const app = express();
const prisma = new PrismaClient();

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set upload destination directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Set uploaded file name
  }
});

const upload = multer({ storage: storage }); // Initialize multer with defined storage

// Function to encrypt data
const encrypt = (input, secretKey) => {
  const iv = randomBytes(16); // Generate random initialization vector
  const cipher = createCipheriv('aes-256-cbc', secretKey, iv); // Create cipher with AES encryption
  const encryptedData = Buffer.concat([cipher.update(input), cipher.final()]); // Encrypt data
  return { iv: iv.toString('hex'), encryptedData: encryptedData.toString('hex') }; // Return initialization vector and encrypted data
};

// Function to decrypt data
const decrypt = (iv, encryptedData, secretKey) => {
  const decipher = createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex')); // Create decipher with AES decryption
  const decryptedData = Buffer.concat([decipher.update(Buffer.from(encryptedData, 'hex')), decipher.final()]); // Decrypt data
  return decryptedData; // Return decrypted data
};

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded'); // Check if file is uploaded
    }

    const secretKey = req.body.secretKey ? Buffer.from(req.body.secretKey.padEnd(32, req.body.secretKey), 'utf-8') : Buffer.from(process.env.SECRET_KEY.padEnd(32, process.env.SECRET_KEY), 'utf-8');

    // Read uploaded image file
    const imageBuffer = fs.readFileSync(req.file.path);

    // Encrypt image data
    const { iv, encryptedData } = encrypt(imageBuffer, secretKey);

    // Save encrypted image data to database
    const savedImage = await prisma.encryptedImage.create({ data: { iv: iv, encryptedData: encryptedData } });

    // Delete uploaded image file
    fs.unlinkSync(req.file.path);

    res.status(200).send({id: savedImage.id, message: 'Image uploaded successfully'}); // Send success response
  } catch (error) {
    console.error('Error uploading image:', error); // Log error
    res.status(500).send('Error uploading image'); // Send error response
  }
});

// Download endpoint
app.get('/download/:id', async (req, res) => {
  try {
    const imageId = `${req.params.id}`;
    const secretKey = req.query.secretKey ? Buffer.from(req.query.secretKey.padEnd(32, req.query.secretKey), 'utf-8') : Buffer.from(process.env.SECRET_KEY.padEnd(32, process.env.SECRET_KEY), 'utf-8');
    
    // Retrieve encrypted image data from database
    const encryptedImage = await prisma.encryptedImage.findUnique({ where: { id: imageId } });
    if (!encryptedImage) {
      return res.status(404).send('Image not found'); // Send error response if image not found
    }
    
    // Decrypt image data
    const decryptedData = decrypt(encryptedImage.iv, encryptedImage.encryptedData, secretKey);
    
    // Send decrypted image data as response
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': decryptedData.length
    });
    res.end(decryptedData);
  } catch (error) {
    console.log("error.message", error.message)
    if(error.message.includes('bad decrypt')) {
      return res.status(400).send('Wrong key provided'); // Send error response for incorrect decryption key
    }
    console.error('Error downloading image:', error); // Log error
    res.status(500).send('Error downloading image'); // Send error response
  }
});

// Serve Swagger UI
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Set up server to listen on specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log server startup message
});
