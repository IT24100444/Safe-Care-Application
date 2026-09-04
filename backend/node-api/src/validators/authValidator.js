import { body } from 'express-validator'

export const registerValidator = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters').matches(/[A-Za-z]/).withMessage('Password must contain a letter').matches(/[0-9]/).withMessage('Password must contain a number'),
  body('preferredLanguage').isIn(['en', 'si', 'ta']).withMessage('Preferred language must be en, si, or ta'),
  body('role').not().exists().withMessage('Role cannot be set during public registration'),
]
export const loginValidator = [body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(), body('password').isString().notEmpty().withMessage('Password is required')]
