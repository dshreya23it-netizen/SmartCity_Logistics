// database/mongoDB.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use your MongoDB connection string
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dshreya23it_db_user:5SkbO2Jw9zoCzBWF@cluster0.7y5klyp.mongodb.net/smartcity_logistics?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;