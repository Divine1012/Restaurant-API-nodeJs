import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    role: { type: String, default: 'user' }
});

const restaurantSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  opening_hours: String,
});

const menuSchema = new mongoose.Schema({
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant",
    required: true, },
  name: String,
  description: String,
  price: Number,
  category: String,
});

export const User = mongoose.model("User", UserSchema);
export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export const Menu = mongoose.model("Menu", menuSchema);
