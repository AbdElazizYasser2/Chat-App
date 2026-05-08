import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .optional(),

      bio: z
        .string()
        .trim()
        .max(150, "Bio must be at most 150 characters")
        .optional(),

      avatar: z
        .string()
        .url("Avatar must be a valid URL")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({ required_error: "Current password is required" })
        .min(1, "Current password is required"),

      newPassword: z
        .string({ required_error: "New password is required" })
        .min(6, "New password must be at least 6 characters")
        .max(100, "New password is too long")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),

      confirmPassword: z
        .string({ required_error: "Confirm password is required" }),
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: "New password must be different from the current password",
      path: ["newPassword"],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export const searchUsersSchema = z.object({
  query: z.object({
    q: z
      .string({ required_error: "Search keyword is required" })
      .trim()
      .min(1, "Search keyword is required")
      .max(50, "Search keyword must be at most 50 characters"),

    page: z
      .string()
      .regex(/^\d+$/, "Page must be a number")
      .transform(Number)
      .refine((n) => n >= 1, "Page must be at least 1")
      .optional()
      .default("1"),

    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a number")
      .transform(Number)
      .refine((n) => n >= 1 && n <= 50, "Limit must be between 1 and 50")
      .optional()
      .default("20"),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    userId: z
      .string({ required_error: "User ID is required" })
      .regex(/^[a-fA-F0-9]{24}$/, "Invalid user ID"),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["online", "offline", "away"], {
      errorMap: () => ({
        message: "Status must be online, offline, or away",
      }),
    }),
  }),
});