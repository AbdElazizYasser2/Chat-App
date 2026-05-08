import { z } from "zod";

const mongoId = (fieldName) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .regex(/^[a-fA-F0-9]{24}$/, `${fieldName} is invalid`);

export const sendMessageSchema = z.object({
  body: z
    .object({
      content: z
        .string()
        .trim()
        .min(1, "Message content is required")
        .max(2000, "Message must be at most 2000 characters")
        .optional(),

      type: z
        .enum(["text", "image", "file", "audio", "video"], {
          errorMap: () => ({
            message:
              "Type must be text, image, file, audio, or video",
          }),
        })
        .default("text"),

      roomId: mongoId("Room ID").optional(),

      conversationId: mongoId("Conversation ID").optional(),

      replyTo: mongoId("Message ID").optional(),

      attachment: z
        .object({
          url: z
            .string({ required_error: "File URL is required" })
            .url("Invalid file URL"),

          filename: z
            .string()
            .max(255, "Filename is too long")
            .optional(),

          size: z
            .number()
            .max(
              50 * 1024 * 1024,
              "File size must be less than 50MB"
            )
            .optional(),

          mimeType: z.string().optional(),
        })
        .optional(),
    })
    .refine((data) => data.roomId || data.conversationId, {
      message: "You must provide either roomId or conversationId",
    })
    .refine((data) => !(data.roomId && data.conversationId), {
      message:
        "You cannot provide both roomId and conversationId together",
    })
    .refine(
      (data) => {
        if (data.type === "text") return !!data.content;
        return !!data.attachment;
      },
      {
        message:
          "Text messages require content, and media messages require attachment",
      }
    ),
});

export const editMessageSchema = z.object({
  params: z.object({
    messageId: mongoId("Message ID"),
  }),

  body: z.object({
    content: z
      .string({ required_error: "New content is required" })
      .trim()
      .min(1, "New content is required")
      .max(2000, "Message must be at most 2000 characters"),
  }),
});

export const deleteMessageSchema = z.object({
  params: z.object({
    messageId: mongoId("Message ID"),
  }),
});

export const getRoomMessagesSchema = z.object({
  params: z.object({
    roomId: mongoId("Room ID"),
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

export const reactToMessageSchema = z.object({
  params: z.object({
    messageId: mongoId("Message ID"),
  }),

  body: z.object({
    emoji: z
      .string({ required_error: "Emoji is required" })
      .min(1, "Emoji is required")
      .max(10, "Emoji is too long"),
  }),
});

export const markAsReadSchema = z.object({
  body: z.object({
    messageIds: z
      .array(mongoId("Message ID"), {
        required_error: "Message IDs array is required",
      })
      .min(1, "You must provide at least one message")
      .max(100, "You cannot send more than 100 messages at once"),
  }),
});