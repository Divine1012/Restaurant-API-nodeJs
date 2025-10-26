import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// ✅ Connexion MongoDB
export const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === "test") {
      console.log("🧪 Mode test : pas de connexion réelle à MongoDB");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ Erreur connexion MongoDB :", err);
  }
};

// ✅ Modèle User
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, default: "user" },
});
export const User = mongoose.model("User", userSchema);

// ✅ Modèle Restaurant
const restaurantSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  opening_hours: String,
});
export const Restaurant = mongoose.model("Restaurant", restaurantSchema);

// ✅ Modèle Menu
const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
});
export const Menu = mongoose.model("Menu", menuSchema);
