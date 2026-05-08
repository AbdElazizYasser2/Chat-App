import { z } from "zod";

export const createRoomSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Room name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),

    description: z
      .string()
      .trim()
      .max(200, "Description must be at most 200 characters")
      .optional(),

    type: z
      .enum(["public", "private", "group"], {
        errorMap: () => ({ message: "Type must be public, private, or group" }),
      })
      .default("public"),

    requiresApproval: z.boolean().default(false),
  }),
});

export const updateRoomSchema = z.object({
  params: z.object({
    roomId: z
      .string({ required_error: "Room ID is required" })
      .regex(/^[a-fA-F0-9]{24}$/, "Invalid room ID"),
  }),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .max(200, "Description must be at most 200 characters")
        .optional(),

      requiresApproval: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
});

export const joinRoomSchema = z.object({
  params: z.object({
    roomId: z
      .string({ required_error: "Room ID is required" })
      .regex(/^[a-fA-F0-9]{24}$/, "Invalid room ID"),
  }),
});

export const leaveRoomSchema = z.object({
  params: z.object({
    roomId: z
      .string({ required_error: "Room ID is required" })
      .regex(/^[a-fA-F0-9]{24}$/, "Invalid room ID"),
  }),
});

export const changeMemberRoleSchema = z.object({
  params: z.object({
    roomId: z
      .string({ required_error: "Room ID is required" })
      .regex(/^[a-fA-F0-9]{24}$/, "Invalid room ID"),

    userId: z
      .string({ required_error: "User ID is required" })
      .regex(/^[a-fA-F0-9]{24}$/, "Invalid user ID"),
  }),

  body: z.object({
    role: z.enum(["member", "admin"], {
      errorMap: () => ({ message: "Role must be member or admin" }),
    }),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    roomId: z
      .string({ required_error: "Room ID is required" })
      .regex(/^[a-fA-F0-9]{24}$/, "Invalid room ID"),

    userId: z
      .string({ required_error: "User ID is required" })
      .regex(/^[a-fA-F0-9]{24}$/, "Invalid user ID"),
  }),
});

export const searchRoomsSchema = z.object({
  query: z.object({
    q: z
      .string({ required_error: "Search keyword is required" })
      .trim()
      .min(1, "Search keyword is required")
      .max(50, "Search keyword must be at most 50 characters"),

    type: z.enum(["public", "private", "group"]).optional(),

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
