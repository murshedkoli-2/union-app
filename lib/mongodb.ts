import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-dashboard';
const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI;

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

    cached.promise = (async () => {
      const urisToTry = [MONGODB_URI];

      if (MONGODB_URI.startsWith('mongodb+srv://') && MONGODB_DIRECT_URI) {
        urisToTry.push(MONGODB_DIRECT_URI);
      }

      let lastError: unknown = null;

      for (const [index, uri] of urisToTry.entries()) {
        try {
          const uriMode = uri.startsWith('mongodb+srv://') ? 'SRV' : 'DIRECT';
          console.info(
            index === 0
              ? `ℹ️ Attempting MongoDB connection using ${uriMode} URI`
              : `ℹ️ Attempting MongoDB connection using ${uriMode} URI (fallback)`
          );

          const conn = await mongoose.connect(uri, opts);
          console.log(
            index === 0
              ? '✅ MongoDB connected successfully'
              : '✅ MongoDB connected successfully using direct URI fallback'
          );
          return conn;
        } catch (error: unknown) {
          lastError = error;

          const mongoError = error as { code?: string | number; syscall?: string; name?: string };
          const isSrvDnsError = mongoError.code === 'ECONNREFUSED' && mongoError.syscall === 'querySrv';
          const canFallback = index < urisToTry.length - 1;

          if (isSrvDnsError && canFallback) {
            console.warn('⚠️ MongoDB SRV DNS lookup failed. Retrying with MONGODB_DIRECT_URI.');
            continue;
          }

          console.error('❌ MongoDB connection error:', error);

          if (mongoError.name === 'MongooseServerSelectionError') {
            if (uri.includes('mongodb.net')) {
              console.error('❌ Could not connect to MongoDB Atlas. Please check your connection string and network connectivity.');
              console.error('❌ Make sure your IP address is whitelisted in MongoDB Atlas network access settings.');
              if (isSrvDnsError) {
                console.error('❌ DNS SRV lookup was refused by your network DNS server.');
                console.error('❌ Add MONGODB_DIRECT_URI in .env.local to use the non-SRV Atlas connection string.');
              }
            } else {
              console.error('❌ Could not connect to local MongoDB. Please ensure MongoDB is installed and running on your system.');
              console.error('❌ You can download MongoDB from: https://www.mongodb.com/try/download/community');
            }
          } else if (mongoError.name === 'MongoServerError' && mongoError.code === 8000) {
            console.error('❌ MongoDB Atlas authentication failed. Please check your username and password in the connection string.');
            console.error('❌ Make sure to replace "your_username" and "your_password" in your .env.local file with actual credentials.');
          }

          break;
        }
      }

      if (cached) {
        cached.promise = null;
      }

      throw lastError;
    })();
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
