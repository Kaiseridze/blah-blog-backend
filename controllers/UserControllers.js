import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModel from "../models/User.js";

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "mambers",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    if (UserModel.findOne({ email: req.body.email })) {
      return res.status(500).json({
        message: "User with this e-mail already exists",
      });
    }
    res.status(500).json({
      message: "Failed to register",
    });
  }
};
export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "Wrong login or password",
      });
    }

    const passValidator = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!passValidator) {
      return res.status(404).json({
        message: "Wrong login or password",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "mambers",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to login",
    });
  }
};
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).populate("posts");

    if (!user) {
      res.status(404).json({
        message: "You are not authorized",
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    res.status(403).json({
      message: "No access",
    });
  }
};
export const changeAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const user = await UserModel.findByIdAndUpdate(req.userId, {
      avatarUrl: avatarUrl,
    });

    if (!avatarUrl) return res.json({ message: "Image is not found" });

    user.save();

    res.json(user);
  } catch (error) {
    return console.log(error);
  }
};
export const removeAvatar = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.userId, {
      avatarUrl: "",
    });

    if (!req.userId) return res.json({ message: "User not found" });

    user.save();

    res.json(user);
  } catch (error) {
    return console.log(error);
  }
};
