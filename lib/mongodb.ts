import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    throw new Error("!Was not defined in .env file the MONGO_URI")
}

let cached = (global as any).mongoose || { conn: null, promise: null }

async function connectToDatabase() {
    if (cached.com) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI!, {
            bufferCommands: false
        }).then((m => {
            return m
        }));

    }

    cached.conn = await cached.promise;
    (global as any).mongoose = cached
    return cached.conn
}

export default connectToDatabase;