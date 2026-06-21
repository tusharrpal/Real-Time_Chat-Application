import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protectRoute } from '../middleware/authMiddleware.js';
import { getUsersForSidebar, getMessages, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif|pdf|txt|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Supported file types: Images (jpeg, jpg, png, gif), PDF, TXT, DOC, DOCX.'));
    }
  },
});

// Routes
router.get('/users', protectRoute, getUsersForSidebar);
router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, upload.single('media'), sendMessage);

export default router;
