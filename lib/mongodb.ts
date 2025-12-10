import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-dashboard';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      
      // Provide more specific error messages
      if (error.name === 'MongooseServerSelectionError') {
        if (MONGODB_URI.includes('mongodb.net')) {
          console.error('❌ Could not connect to MongoDB Atlas. Please check your connection string and network connectivity.');
          console.error('❌ Make sure your IP address is whitelisted in MongoDB Atlas network access settings.');
        } else {
          console.error('❌ Could not connect to local MongoDB. Please ensure MongoDB is installed and running on your system.');
          console.error('❌ You can download MongoDB from: https://www.mongodb.com/try/download/community');
        }
      } else if (error.name === 'MongoServerError' && error.code === 8000) {
        console.error('❌ MongoDB Atlas authentication failed. Please check your username and password in the connection string.');
        console.error('❌ Make sure to replace "your_username" and "your_password" in your .env.local file with actual credentials.');
      }
      
      if (cached) {
        cached.promise = null;
      }
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
