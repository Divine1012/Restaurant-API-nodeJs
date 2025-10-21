import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/trainstation";

const DBNAME = "trainstation";

mongoose.connect(MONGODB_URI, {
    dbName: DBNAME,
});

mongoose.connection.on("error", (e) => {
    console.log("Erreur", e.toString());
});

mongoose.connection.on("connected", () => {
    console.log("Connection à MongoDB établi !");
});

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
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  name: String,
  description: String,
  price: Number,
  category: String,
});

export const User = mongoose.model("User", UserSchema);
export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export const Menu = mongoose.model("Menu", menuSchema);