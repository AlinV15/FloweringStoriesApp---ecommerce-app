// app/api/order/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // ✅ Already correct

        await connectToDatabase();

        const orderResult = await Order.findById(id)
            .populate('user', 'firstName lastName email')
            .populate({
                path: 'items',
                populate: {
                    path: 'product',
                    select: 'name price image type'
                }
            })
            .populate('address')
            .lean();

        // Ensure orderResult is not null or an array
        if (!orderResult || Array.isArray(orderResult)) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const order = orderResult as any;

        // Check if user is authenticated
        const session = await getServerSession(authOptions);

        if (session) {
            // For authenticated users, check authorization
            const isOwner = order.user?._id?.toString() === (session.user as any).id;
            const isAdmin = (session.user as any).role === "admin";

            if (!isOwner && !isAdmin) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }
        } else {
            // For guest users, we'll allow access but with limited information
            // You might want to add additional validation here (like checking a token)
            // For now, we'll allow read access to any order
        }

        // Transform data for frontend consistency
        const transformedOrder = {
            _id: order._id.toString(),
            customer: order.user ? {
                _id: order.user._id.toString(),
                firstName: order.user.firstName,
                lastName: order.user.lastName,
                email: order.user.email
            } : null,
            guestName: order.guestName,
            guestEmail: order.guestEmail,
            clientName: order.clientName,
            items: order.items?.map((item: any) => ({
                _id: item._id.toString(),
                product: {
                    _id: item.product._id.toString(),
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    type: item.product.type
                },
                quantity: item.quantity,
                lineAmount: item.lineAmount
            })) || [],
            address: order.address,
            totalAmount: order.totalAmount,
            status: order.status,
            payment: order.payment,
            deliveryMethod: order.deliveryMethod,
            paymentMethod: order.paymentMethod,
            note: order.note,
            createdAt: order.createdAt?.toISOString(),
            updatedAt: order.updatedAt?.toISOString()
        };

        return NextResponse.json(transformedOrder);

    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({
            error: 'Failed to fetch order',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) { // ✅ Fixed: Promise
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params; // ✅ Fixed: await params and destructure

        await connectToDatabase();

        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Check authorization
        const isOwner = order.user?.toString() === (session.user as any).id;
        const isAdmin = (session.user as any).role === "admin";

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        await Order.findByIdAndDelete(id);

        return NextResponse.json({ message: "Order deleted successfully" });

    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({
            error: 'Failed to delete order',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) { // ✅ Fixed: Promise
    try {
        const session = await getServerSession(authOptions);

        const { id } = await params; // ✅ Fixed: await params and destructure

        // Only admins can update orders
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        await connectToDatabase();

        const body = await req.json();

        // Build update object with validation
        const updateData: any = {};

        // Validate and set status
        if (body.status) {
            const validStatuses = ['pending', 'shipped', 'delivered'];
            if (!validStatuses.includes(body.status)) {
                return NextResponse.json({ error: "Invalid status. Must be: pending, shipped, or delivered" }, { status: 400 });
            }
            updateData.status = body.status;
        }

        // Validate and set delivery method
        if (body.deliveryMethod) {
            const validMethods = ['courier', 'pickup'];
            if (!validMethods.includes(body.deliveryMethod)) {
                return NextResponse.json({ error: "Invalid delivery method. Must be: courier or pickup" }, { status: 400 });
            }
            updateData.deliveryMethod = body.deliveryMethod;
        }

        // Handle note
        if (body.note !== undefined) {
            updateData.note = body.note.trim() || null;
        }

        // Handle payment status update
        if (body.payment) {
            const currentOrder = await Order.findById(id); // ✅ Use id directly
            if (!currentOrder) {
                return NextResponse.json({ error: "Order not found" }, { status: 404 });
            }

            const validPaymentStatuses = ['succeeded', 'processing', 'requires_payment_method', 'canceled'];
            if (body.payment.status && !validPaymentStatuses.includes(body.payment.status)) {
                return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
            }

            // Merge with existing payment data
            updateData.payment = {
                ...currentOrder.payment,
                ...body.payment
            };
        }

        // Add updated timestamp
        updateData.updatedAt = new Date();

        // Update the order
        const updatedOrderResult = await Order.findByIdAndUpdate(
            id, // ✅ Use id directly
            updateData,
            {
                new: true,
                runValidators: true
            }
        )
            .populate('user', 'firstName lastName email')
            .populate({
                path: 'items',
                populate: {
                    path: 'product',
                    select: 'name price image'
                }
            })
            .populate('address')
            .lean();

        if (!updatedOrderResult || Array.isArray(updatedOrderResult)) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const updatedOrder = updatedOrderResult as any;

        // Transform response data
        const transformedOrder = {
            _id: updatedOrder._id.toString(),
            user: updatedOrder.user ? {
                _id: updatedOrder.user._id.toString(),
                firstName: updatedOrder.user.firstName,
                lastName: updatedOrder.user.lastName,
                email: updatedOrder.user.email
            } : null,
            guestName: updatedOrder.guestName,
            guestEmail: updatedOrder.guestEmail,
            clientName: updatedOrder.clientName,
            items: updatedOrder.items?.map((item: any) => ({
                _id: item._id.toString(),
                product: {
                    _id: item.product._id.toString(),
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image
                },
                quantity: item.quantity,
                lineAmount: item.lineAmount
            })) || [],
            address: updatedOrder.address,
            totalAmount: updatedOrder.totalAmount,
            status: updatedOrder.status,
            payment: updatedOrder.payment,
            deliveryMethod: updatedOrder.deliveryMethod,
            paymentMethod: updatedOrder.paymentMethod,
            note: updatedOrder.note,
            createdAt: updatedOrder.createdAt?.toISOString(),
            updatedAt: updatedOrder.updatedAt?.toISOString()
        };

        return NextResponse.json(transformedOrder);

    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({
            error: 'Failed to update order',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}