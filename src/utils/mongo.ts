import * as mongoose from "mongoose";

export const connectMongo = async () => {
  await mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URI}/${process.env.MONGO_DATABASE}`
  );

  console.log("Connect to MongoDB");
};
