const path = require('path');
const fs = require('fs');
const multer = require('multer');

const MAX_IMAGES = 5;
const uploadDir = path.join(__dirname, '../../uploads/products');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
      ? ext
      : '.jpg';
    const name = `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype?.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: MAX_IMAGES,
  },
});

module.exports = {
  upload,
  MAX_IMAGES,
  uploadDir,
};
