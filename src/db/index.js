import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
        // Send the error to the caller
        throw error;
    }
};

export default connectDB;
