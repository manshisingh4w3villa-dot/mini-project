const cloudinary = require('cloudinary').v2;

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

async function uploadProfileImage(file, userId) {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!hasCloudinaryConfig) {
    throw new Error('Cloudinary config is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }

  let result;
  try {
    result = await uploadBuffer(file.buffer, {
      folder: 'nook/profile-images',
      public_id: `user-${userId}`,
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 512, height: 512, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
  } catch (error) {
    const uploadError = new Error('Cloudinary rejected the image upload. Check your Cloudinary cloud name, API key, API secret, and account permissions.');
    uploadError.statusCode = error.http_code === 401 || error.http_code === 403 ? 502 : 502;
    uploadError.cause = error;
    throw uploadError;
  }

  return result.secure_url;
}

module.exports = { uploadProfileImage };