function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

async function uploadImage({ fileBuffer, fileName, folder }) {
  // Lazy require so tests can mock this module without needing ImageKit installed/initialized.
  // eslint-disable-next-line global-require
  const ImageKit = require("imagekit");
  const { v4: uuidv4 } = require("uuid");

  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "testPublicKey",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "testPrivateKey",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "testUrlEndpoint",
  });

  const result = await imagekit.upload({
    file: fileBuffer,
    fileName: uuidv4(),
    folder,
  });

  return {
    url: result.url,
    thumbnail: result.thumbnailUrl,
    id: result.fileId,
  };
}

module.exports = {
  uploadImage,
};
