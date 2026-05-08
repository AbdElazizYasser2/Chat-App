import { z } from "zod";

const mongoId = (fieldName) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .regex(/^[a-fA-F0-9]{24}$/, `${fieldName} is invalid`);

export const startConversationSchema = z.object({
  params: z.object({
    userId: mongoId("User ID"),
  }),
});

export const getConversationMessagesSchema = z.object({
  params: z.object({
    conversationId: mongoId("Conversation ID"),
  }),

  query: z.object({
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
      .refine(
        (n) => n >= 1 && n <= 100,
        "Limit must be between 1 and 100"
      )
      .optional()
      .default("50"),

    before: mongoId("Message ID").optional(),
  }),
});

export const hideConversationSchema = z.object({
  params: z.object({
    conversationId: mongoId("Conversation ID"),
  }),
});

export const deleteConversationSchema = z.object({
  params: z.object({
    conversationId: mongoId("Conversation ID"),
  }),
});