// New customer validation schema
import { z } from "zod";

export const customerSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone number is required").max(20, "Phone number too long"),
    newsletter: z.boolean().optional().default(false)
});
export const validateCustomer = (data: any) => {
    return customerSchema.safeParse(data);
};

export type CustomerType = z.infer<typeof customerSchema>;