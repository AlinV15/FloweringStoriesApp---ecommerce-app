import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import Product from "@/lib/models/Product";
import User from "@/lib/models/User";
import { orderSchema, orderItemSchema } from "@/lib/validators";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Address from "@/lib/models/Address";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    await connectToDatabase();
    const body = await req.json();

    // Extragem items separat pentru validare + creare
    const { items, customer, address, ...orderData } = body;

    const itemSchema = z.array(orderItemSchema);
    const itemsValidation = itemSchema.safeParse(items);
    const orderValidation = orderSchema.safeParse({
        ...orderData,
        // Include customer data in validation
        guestEmail: !userId ? customer?.email : undefined,
        guestName: !userId ? `${customer?.firstName} ${customer?.lastName}` : undefined,
    });

    if (!itemsValidation.success) {
        console.log("Items validation failed:", itemsValidation.error.issues);
    }
    if (!orderValidation.success) {
        console.log("Order validation failed:", orderValidation.error.issues);
    }

    if (!itemsValidation.success || !orderValidation.success) {
        console.log("Nepoate ai probleme cu validarea");
        return NextResponse.json({
            error: {
                items: itemsValidation.error?.flatten?.(),
                order: orderValidation.error?.flatten?.()
            }
        }, { status: 400 });
    }

    // Validate customer data
    if (!customer || !customer.email || !customer.firstName || !customer.lastName) {
        console.log("Date client incomplete");
        return NextResponse.json({
            error: "Date client obligatorii: firstName, lastName, email"
        }, { status: 400 });
    }

    if (!userId && (!customer.email || !customer.firstName)) {
        console.log("Nu sunt buni numele pentru guest");
        return NextResponse.json({
            error: "Trebuie să furnizezi nume și email ca guest."
        }, { status: 400 });
    }

    try {
        // Validate products and stock
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return NextResponse.json({
                    error: `Produsul ${item.product} nu a fost găsit`
                }, { status: 400 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json({
                    error: `Stoc insuficient pentru ${product.name}`
                }, { status: 400 });
            }
        }

        // Creează address doar dacă e courier
        let savedAddress = null;
        if (orderData.deliveryMethod === 'courier' && address) {
            savedAddress = await Address.create({
                street: address.street,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
                details: address.details
            });
        }

        // Update user data if logged in (save personal info for next time)
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                firstName: customer.firstName,
                lastName: customer.lastName,
                phone: customer.phone,
                newsletter: customer.newsletter || false,
                // Save the address as default if courier delivery
                ...(savedAddress && { address: savedAddress._id })
            });
        }

        // Creează fiecare OrderItem în baza de date și actualizează stock-ul
        const createdOrderItems = await Promise.all(
            items.map(async (item: any) => {
                const orderItem = await OrderItem.create({
                    product: item.product,
                    quantity: item.quantity,
                    lineAmount: item.lineAmount
                });

                // ✅ NU mai scădem stocul aici!
                // Stocul a fost deja scăzut în cartStore prin reserve-stock API

                console.log(`✅ OrderItem created for product ${item.product}, quantity: ${item.quantity}`);

                return orderItem._id;
            })
        );

        // Calculează total
        const total = items.reduce((acc: number, item: any) => acc + item.lineAmount, 0);

        // Creează comanda
        const order = await Order.create({
            user: userId || undefined,
            guestEmail: !userId ? customer.email : undefined,
            guestName: !userId ? `${customer.firstName} ${customer.lastName}` : undefined,
            items: createdOrderItems,
            address: savedAddress ? savedAddress._id : undefined,
            customer: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone
            },
            totalAmount: total,
            deliveryMethod: orderData.deliveryMethod,
            paymentMethod: orderData.paymentMethod,
            note: orderData.note,
            status: "pending",
            payment: {
                amount: total,
                currency: orderData.payment?.currency || "eur",
                status: "processing",
                method: orderData.payment?.method || 'card'
                // stripePaymentIntentId va fi adăugat mai târziu
            }
        });

        // Populate order before returning
        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: 'items',
                populate: {
                    path: 'product',
                    select: 'name type image price discount'
                }
            })
            .populate('address')
            .lean();

        return NextResponse.json({
            success: true,
            order: populatedOrder
        }, { status: 201 });

    } catch (error) {
        console.error("Eroare la creare comandă:", error);
        return NextResponse.json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

    await connectToDatabase();

    let orders;
    if ((session.user as any).role === "admin") {
        orders = await Order.find()
            .populate({
                path: "items",
                populate: {
                    path: "product",
                    select: "name type image price"
                }
            })
            .populate("user", "email firstName lastName")
            .populate("address")
            .sort({ createdAt: -1 });
    } else {
        orders = await Order.find({ user: session.user.id })
            .populate({
                path: "items",
                populate: {
                    path: "product",
                    select: "name type image price"
                }
            })
            .populate("address")
            .sort({ createdAt: -1 });
    }

    return NextResponse.json({
        success: true,
        orders
    });
}