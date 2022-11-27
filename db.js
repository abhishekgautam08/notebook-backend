const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URL;

const connectToMongo = () => {
  mongoose.connect(mongoURI, () => {
    console.log("Connect to Mongo Succesfully");
  });
};

module.exports = connectToMongo;
