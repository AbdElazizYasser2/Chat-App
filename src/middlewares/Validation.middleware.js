import { ZodError } from "zod";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.slice(1).join("."),
        message: e.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Invalid data",
        errors,
      });
    }

    next(err);
  }
};

export default validate;