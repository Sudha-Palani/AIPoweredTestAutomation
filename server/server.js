const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();

// Configure CORS
app.use(cors());

// Configure multer for .docx files
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only .docx files are allowed'));
    }
  }
});

// Serve generated files statically
app.use('/generated', express.static('generated'));

app.post('/api/generate-test-cases', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Call the Python script with the file path
    const pythonProcess = spawn('python', [
      'testcase_generator.py',
      req.file.path
    ]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python script: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Failed to generate test cases' });
      }

      try {
        const result = JSON.parse(dataString);
        
        // Send both the test cases and the file path
        res.json({
          testCases: result.testCases,
          wordFilePath: `/generated/${path.basename(result.wordFilePath)}`
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse Python script output' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cleanup endpoint for uploaded files
app.delete('/api/cleanup', (req, res) => {
  // Add cleanup logic for temporary files
  res.status(200).send('Cleanup completed');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});