const { body, validationResult } = require('express-validator');

const validateResourceUrl = [
  body('vault').notEmpty().withMessage('vault is required'),
  body('url').if(body('type').not().equals('snippet')).isURL().withMessage('Valid URL required'),
];

const validateResourceSnippet = [
  body('title').trim().notEmpty().withMessage('title is required for snippets'),
  body('snippet.code').notEmpty().withMessage('snippet.code is required'),
  body('snippet.lang').notEmpty().withMessage('snippet.lang is required'),
  body('vault').notEmpty().withMessage('vault is required'),
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

module.exports = { validateResourceUrl, validateResourceSnippet, handleValidation };
