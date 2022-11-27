const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017/notebookDB";

const connectToMongo = () => {
  mongoose.connect(mongoURI, () => {
    console.log("Connect to Mongo Succesfully");
  });
};

module.exports = connectToMongo;
