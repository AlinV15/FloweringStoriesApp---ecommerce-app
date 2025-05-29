import { z } from "zod";

// lib/validators/userSchema.ts (updated)
export const userUpdateSchema = z.object({
    firstName: z.string().min(1).max(50).trim().optional(),
    lastName: z.string().min(1).max(50).trim().optional(),
    birthDate: z.string().optional(),
    genre: z.enum(["male", "female", "other"]).optional(),
    role: z.enum(["user", "admin"]).optional(),
    // Don't allow email updates through this route
});

// Schema for password change (separate route)
export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase and numbers"),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
