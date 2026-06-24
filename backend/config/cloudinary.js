const fs = require('fs');
const path = require('path');

let cloudinary = null;
let isCloudinaryConfigured = false;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  try {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    isCloudinaryConfigured = true;
    console.log('☁️ Cloudinary integration initialized successfully.');
  } catch (error) {
    console.warn('⚠️ Cloudinary module not loaded or configuration failed. Fallback storage enabled.');
  }
} else {
  console.log('⚠️ Cloudinary credentials not configured. Operating in local storage mode.');
}

const uploadService = {
  uploadFile: async (fileBuffer, fileName, folder = 'pms_uploads') => {
    if (isCloudinaryConfigured && cloudinary) {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: folder, resource_type: 'auto', public_id: path.parse(fileName).name },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error.message);
              // Fall back to local file system
              return resolve(uploadService.uploadLocal(fileBuffer, fileName));
            }
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              sizeBytes: result.bytes,
              storageType: 'cloudinary'
            });
          }
        ).end(fileBuffer);
      });
    }
    return uploadService.uploadLocal(fileBuffer, fileName);
  },

  uploadLocal: async (fileBuffer, fileName) => {
    try {
      const uploadDir = path.join(__dirname, '../public/uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const safeFileName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
      const filePath = path.join(uploadDir, safeFileName);
      
      fs.writeFileSync(filePath, fileBuffer);
      
      return {
        url: `/uploads/${safeFileName}`,
        public_id: safeFileName,
        sizeBytes: fileBuffer.length,
        storageType: 'local'
      };
    } catch (err) {
      console.error('❌ Failed to upload locally:', err.message);
      throw err;
    }
  }
};

module.exports = uploadService;
