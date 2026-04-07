const mongoose = require("mongoose");
const productModel = require("../models/product.model");
const { uploadImage } = require("../services/imagekit.service");

const createProduct = async (req, res, next) => {
  try {
    const { title, description, priceAmount, priceCurrency, amount, currency } =
      req.body;

    const seller = req.user?.id;

    const normalizedAmount = Number(priceAmount ?? amount);
    const normalizedCurrency = priceCurrency ?? currency ?? "INR";

    if (!seller || Number.isNaN(normalizedAmount)) {
      return res.status(400).json({ message: "Validation failed" });
    }

    if (!mongoose.isValidObjectId(seller)) {
      return res.status(400).json({ message: "Invalid seller id" });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const images = files.length
      ? await Promise.all(
          files.map(async (file) => {
            const uploaded = await uploadImage({
              fileBuffer: file.buffer,
              fileName: file.originalname,
              folder: "products",
            });

            return {
              url: uploaded.url,
              thumbnail: uploaded.thumbnail, 
              id: uploaded.id,
            };
          }),
        )
      : [];

    const product = await productModel.create({
      title,
      description,
      seller,
      price: {
        amount: normalizedAmount,
        currency: normalizedCurrency,
      },
      images,
    });

    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;

    const filter = {};

    // if query is present, search in title and description
    if (q) {
      filter.$text = { $search: q };
    }

    if (minprice) {
      filter["price.amount"] = {
        ...filter["price.amount"],
        $gte: Number(minprice),
      };
    }
    if (maxprice) {
      filter["price.amount"] = {
        ...filter["price.amount"],
        $lte: Number(maxprice),
      };
    }

    const products = await productModel
      .find(filter)
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 20));

    return res.status(200).json({ data: products });
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json({ product: product });
};

const updateProduct = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await productModel.findById(id);

  if (!product) { 
    return res
      .status(404)
      .json({ message: "Product not found or you are not the seller" });
  }

  if (product.seller.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only update your own products" });
  }

  const allowedUpdates = [
    "title",
    "description",
    "priceAmount",
    "priceCurrency",
  ];
  for (const key of allowedUpdates) {
    if (req.body[key]) {
      if (key === "priceAmount") {
        product.price.amount = Number(req.body[key]);
      } else if (key === "priceCurrency") {
        product.price.currency = req.body[key];
      } else {
        product[key] = req.body[key];
      }
    }
  }

  await product.save();

  return res.status(200).json(product);
};

const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.seller.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only delete your own products" });
  }

  await productModel.findByIdAndDelete(id);

  return res.status(200).json({ message: "Product deleted successfully" });
};

const getProductsBySeller = async (req, res, next) => {

  const sellerId = req.user.id;

  const { skip = 0, limit = 20 } = req.query;

  const products = await productModel.find({ seller: sellerId }).skip(Number(skip)).limit(Math.min(Number(limit), 20));

  return res.status(200).json({ data: products });


}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
};
