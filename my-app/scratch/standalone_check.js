import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: String,
  role: String,
  subscription: {
    status: String,
    planName: String,
    startDate: String,
    nextRenewal: String,
    mealsLeft: Number
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function check() {
  try {
    await mongoose.connect("mongodb+srv://bhumigarg704_db_user:5tPqecOsOsB8z7D8@cluster0.ulswg0w.mongodb.net/tiffin_project?retryWrites=true&w=majority&appName=Cluster0");
    const email = "ankitasahu849@gmail.com";
    const user = await User.findOne({ email }).lean();
    console.log("USER_DATA_START");
    console.log(JSON.stringify(user, null, 2));
    console.log("USER_DATA_END");
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

check();
