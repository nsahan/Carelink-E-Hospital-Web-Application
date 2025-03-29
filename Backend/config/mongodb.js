import mongoose from "mongoose";

const connectdb = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected!!!");
  });
  await mongoose.connect(`${process.env.MONGODB_URI}/carelink`);
};

export default connectdb;
