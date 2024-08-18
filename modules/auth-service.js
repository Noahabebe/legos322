const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();

const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User = mongoose.model("User", userSchema);

const initialize = () => {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB_URI);
    db.on("error", (err) => {
      reject(err);
    });
    db.once("open", () => {
      User = db.model("User", userSchema);
      resolve("Schema created!");
    });
  });
};

const registerUser = async (userData) => {
  try {
    if (userData.password !== userData.password2) {
      throw new Error("Passwords do not match");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userData.password, salt);
    userData.password = hash;

    const newUser = new User(userData);

    await newUser.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("User Name already taken");
    }

    throw new Error("There was an error creating the user: " + err.message);
  }
};

const checkUser = async (userData) => {
  try {
    const user = await User.findOne({ userName: userData.userName }).exec();

    if (!user) {
      throw new Error("Unable to find user: " + userData.userName);
    }

    const isMatch = await bcrypt.compare(userData.password, user.password);

    if (!isMatch) {
      throw new Error("Incorrect Password for user: " + userData.userName);
    }

    user.loginHistory.push({
      dateTime: new Date().toString(),
      userAgent: userData.userAgent,
    });

    await User.updateOne(
      { userName: user.userName },
      { $set: { loginHistory: user.loginHistory } }
    ).exec();

    return user;
  } catch (err) {
    throw new Error("There was an error verifying the user: " + err.message);
  }
};

module.exports = {
  initialize,
  registerUser,
  checkUser,
};
