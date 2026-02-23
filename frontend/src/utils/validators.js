import { z } from 'zod'

export const emailSchema    = z.string().email('Invalid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(30)

export const loginSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  username: usernameSchema,
  email:    emailSchema,
  password: passwordSchema,
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path:    ['confirm'],
})

export const buildSchema = z.object({
  name:  z.string().min(3, 'Build name required'),
  style: z.enum(['aggressive', 'defensive', 'balanced', 'support']).optional(),
  notes: z.string().max(500).optional(),
})

export const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id)
