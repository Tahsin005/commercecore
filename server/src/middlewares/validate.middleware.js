import ApiError from '../utils/ApiError.js';

// express middleware to validate request against a Zod schema.
export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.query && req.query) Object.assign(req.query, parsed.query);
    if (parsed.params && req.params) Object.assign(req.params, parsed.params);

    next();
  } catch (error) {
    if (error.name === 'ZodError' || error.issues) {
      const formattedErrors = error.issues.map((issue) => ({
        field: issue.path.join('.').replace(/^(body|query|params)\./, ''),
        message: issue.message,
      }));
      return next(new ApiError(400, 'Validation Error', formattedErrors));
    }
    next(error);
  }
};

export default validate;
