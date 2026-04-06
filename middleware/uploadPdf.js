const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createPdfUploader = (subfolder) => {
  const uploadDir = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + '.pdf';
      cb(null, uniqueName);
    }
  });

  const fileFilter = (req, file, cb) => {
    cb(null, file.mimetype === 'application/pdf');
  };

  return multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
};

module.exports = createPdfUploader;
