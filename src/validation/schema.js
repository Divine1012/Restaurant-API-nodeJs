// src/validation/schemas.js
import Joi from "joi";

export const objectId = Joi.string().hex().length(24).messages({
  "string.length": "id doit être un ObjectId (24 caractères hexadécimaux)",
  "string.hex": "id doit être un ObjectId (hexadécimal)",
});

export const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const restaurantListQuery = paginationQuery.keys({
  sort: Joi.string().valid("name", "address").optional(),
});

export const menuListQuery = paginationQuery.keys({
  sort: Joi.string().valid("price", "category", "name").optional(),
  category: Joi.string().valid("starter", "main", "dessert", "drink", "other").optional(),
});

export const userRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const userUpdateSchema = Joi.object({
  email: Joi.string().email(),
  username: Joi.string().min(3),
  password: Joi.string().min(6),
  role: Joi.string().valid("user", "admin"),
}).min(1);

export const restaurantCreateSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  phone: Joi.string().required(),
  opening_hours: Joi.string().required(),
});

export const restaurantUpdateSchema = restaurantCreateSchema.fork(
  ["name", "address", "phone", "opening_hours"],
  (schema) => schema.optional()
).min(1);

export const menuCreateSchema = Joi.object({
  restaurant_id: objectId.required(),
  name: Joi.string().required(),
  description: Joi.string().allow("", null),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid("starter", "main", "dessert", "drink", "other").default("other"),
});

export const menuUpdateSchema = menuCreateSchema.fork(
  ["restaurant_id", "name", "price"],
  (schema) => schema.optional()
).min(1);