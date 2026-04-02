const errorHandler = (err, res) => {

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: messages.join(', ') },
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: { code: 'DUPLICATE', message: 'Duplicate entry' },
    });
  }

  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  });
};

module.exports = errorHandler;
