import mongoose from "mongoose";

const connectionDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI);
    console.log(`Connected Successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
export default connectionDB;