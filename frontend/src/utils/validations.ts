import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  profileImage: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: 'Max image size is 5MB',
    })
    .refine((file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), {
      message: 'Only .jpg, .png and .webp formats are supported',
    }),
});

export const editProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  profileImage: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: 'Max image size is 5MB',
    })
    .refine((file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), {
      message: 'Only .jpg, .png and .webp formats are supported',
    }),
});

export const postSchema = z.object({
  caption: z.string().trim().min(1, 'Caption must be added').max(500, 'Caption cannot exceed 500 characters'),
  postImage: z
    .instanceof(File, { message: 'Please upload an image for your post' })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Max image size is 5MB',
    })
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), {
      message: 'Only .jpg, .png and .webp formats are supported',
    }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type EditProfileInput = z.infer<typeof editProfileSchema>;
export type CreatePostInput = z.infer<typeof postSchema>;
