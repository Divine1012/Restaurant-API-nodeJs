// src/middlewares/validate.js
import Joi from "joi";

export const validateBody = (schema) => async (req, res, next) => {
  try {
    const value = await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    req.body = value;
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Données invalides",
      details: err.details?.map(d => d.message) || [String(err)],
    });
  }
};

export const validateQuery = (schema) => async (req, res, next) => {
  try {
    const value = await schema.validateAsync(req.query, { abortEarly: false, stripUnknown: true });
    req.query = value;
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Paramètres de requête invalides",
      details: err.details?.map(d => d.message) || [String(err)],
    });
  }
};

export const validateParams = (schema) => async (req, res, next) => {
  try {
    const value = await schema.validateAsync(req.params, { abortEarly: false, stripUnknown: true });
    req.params = value;
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Paramètres de chemin invalides",
      details: err.details?.map(d => d.message) || [String(err)],
    });
  }
};

export const paramsIdSchema = Joi.object({ id: Joi.string().hex().length(24).required() });

export const validationErrorHandler = (err, req, res, next) => {
  if (err?.isJoi) {
    return res.status(400).json({
      message: "Validation error",
      details: err.details?.map(d => d.message) || [],
    });
  }
  return next(err);
};