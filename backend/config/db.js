const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add it to your .env file before starting the server.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        connectionPromise = undefined;
        return conn.connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;
