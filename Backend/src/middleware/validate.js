export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => d.message)
      });
    }
    req.body = value;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true, convert: true });
    if (error) {
      return res.status(400).json({
        message: 'Invalid query parameters',
        details: error.details.map((d) => d.message)
      });
    }
    req.query = value;
    next();
  };
}
