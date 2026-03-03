const userModel = require("../models/users.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const blacklistModel = require("../models/blackList.model")

/**
 * - user register controller
 * - POST /api/auth/register
 */
const userRegisterController = async (req, res) => {
  const { email, name, password } = req.body;

  const isExists = await userModel.findOne({
    email: email,
  });
  if (isExists) {
    return res.status(422).json({
      message: "User already exists with email",
      status: "failed",
    });
  }

  const user = await userModel.create({
    email,
    name,
    password,
  });

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User created successfully",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });

  await emailService.sendRegistrationEmail(user.email, user.name);
};

/**
 * - user login controller
 * - POST /api/auth/login
 */

const userLoginController = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel
    .findOne({
      email,
    })
    .select("+password");

  if (!user) {
    return res.status(401).json({
      message: "Email or password is invalid",
    });
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    return res.status(401).json({
      message: "Email or password is invalid",
    });
  }

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );

  res.cookie("token", token);

  res.status(200).json({
    message: "User login successfully",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
};

/**
 * - user logout controller
 * - POST /api/auth/logout
 */
const userLogoutController = async (req, res) => {
  const token=req.cookies.token || req.headers.authorization?.split(" ")[1]

  if(!token){
    return res.status(200).json({
      message:"token is missing, but user logged out successfully"
    }) 
  }

  

  await blacklistModel.create({ 
    token:token,
  })

  res.clearCookie("token")
  return res.status(200).json({
    message:"User logout successfully"
  })

}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController
};
