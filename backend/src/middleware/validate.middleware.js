const { ZodError } = require('zod');

/**
 * Validation Middleware Factory
 * Accepts a Zod schema and a source ('body', 'query', or 'params').
 * Validates the request data against the schema and returns descriptive 400 errors.
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // Replace with parsed (coerced/transformed) data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed. Please check your input.',
          errors: formattedErrors,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Internal server error during validation.',
      });
    }
  };
};

module.exports = validate;
