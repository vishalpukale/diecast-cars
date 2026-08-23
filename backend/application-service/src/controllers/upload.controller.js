const { success } = require('../utils/response.utils');
const HttpException = require('../utils/HttpException.utils');
const { MAX_IMAGES } = require('../middleware/upload.middleware');

const uploadProductImages = async (req, res) => {
  const files = req.files || [];
  if (!files.length) {
    throw new HttpException(400, 'Please select at least one image');
  }
  if (files.length > MAX_IMAGES) {
    throw new HttpException(400, `Maximum ${MAX_IMAGES} images allowed`);
  }

  const images = files.map((file, index) => ({
    url: `/uploads/products/${file.filename}`,
    alt: file.originalname,
    sort: index,
  }));

  return success(
    res,
    {
      images,
      thumbnailUrl: images[0].url,
      maxImages: MAX_IMAGES,
    },
    'Images uploaded',
    201
  );
};

module.exports = {
  uploadProductImages,
};
