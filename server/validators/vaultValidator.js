const { body, validationResult } = require('express-validator');

const validateVault = [
  body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 50 }).withMessage('name max 50 chars'),
  body('description').optional().isLength({ max: 200 }).withMessage('description max 200 chars'),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.array().map((e) => e.msg).join(', '),
      },
    });
  }
  next();
};

module.exports = { validateVault, handleValidation };
