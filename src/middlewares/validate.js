import { validationError } from "../utils/response.js";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    return validationError(res, err.errors);
  }
};
