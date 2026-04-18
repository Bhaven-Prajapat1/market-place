const cartModel = require("../models/cart.model");

async function getCart(req, res) {
  const user = req.user;
  let cart = await cartModel.findOne({ user: user.id });
  if (!cart) {
    cart = new cartModel({ user: user.id, items: [] });
    await cart.save();
  }
  res.status(200).json({
    cart,
    totals: {
      itemCount: cart.items.length,
      totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
}

async function addItemToCart(req, res) {
  const { productId, quantity } = req.body;
  const user = req.user;

  let cart = await cartModel.findOne({ user: user.id });
  if (!cart) {
    cart = new cartModel({ user: user.id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId,
  );
  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  res.status(200).json({ message: "Item added to cart", cart });
}

async function updateCartItem(req, res) {
  const { productId } = req.params;
  const { quantity } = req.body;
  const user = req.user;

  const cart = await cartModel.findOne({ user: user.id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId,
  );
  if (itemIndex < 0) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  res.status(200).json({ message: "Item updated", cart });
}

async function removeCartItem(req, res) {
  const { productId } = req.params;
  const user = req.user;



  const cart = await cartModel.findOne({ user: user.id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId,
  );

  
  if (itemIndex < 0) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
  res.status(200).json({ message: "Item removed", cart });
}

module.exports = {
  addItemToCart,
  updateCartItem,
  getCart,
  removeCartItem,
};
