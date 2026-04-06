import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const generateAccessTokenAndrefreshToken = async (userId) => {
  try {
    if (!userId) {
      throw new ApiError(402, "userId not found!!");
    }
    const user = await User.findById(userId); // find user bu userId
    if (!user) {
      throw new ApiError(401, "user not found!!");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // update the usermodel
    await user.save({ validateBeforeSave: false }); // save in the database
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh Token! ",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Name is required");
  }

  if (!email || email.trim() === "") {
    throw new ApiError(400, "Email is required");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Invalid email format");
  }

  if (!password || password.trim() === "") {
    throw new ApiError(400, "Password is required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "viewer",
    status: "active",
    // avatar: avatarUrl,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !name) {
    throw new ApiError(404, "username or email is required !");
  }
  if (password === "") {
    throw new ApiError(404, "password field is required");
  }

  const user = await User.findOne({
    $or: [{ name }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const PasswordCheck = await user.isPasswordCorrect(password);
  if (!PasswordCheck) {
    throw new ApiError(404, "Oops !! Incorrect Password!");
  }
  console.log(user._id);

  const { accessToken, refreshToken } =
    await generateAccessTokenAndrefreshToken(user._id);
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  const loggedInUSer = await User.findById(user._id).select(
    "-password -refreshToken ",
  );

  const options = {
    //Now cookies can only be modified by server not frontend
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        {
          user: loggedInUSer,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully",
      ),
    );
});

const logoutUSer = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    //Now cookies can only be modified by server not frontend
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiError(201, "", "User is logged Out"));
});

const refreshUserToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedtoken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedtoken._id);

    if (!user) {
      throw new ApiError(401, "Unauthorized Access");
    }
    // console.log("Incoming Token:", incomingRefreshToken);
    // console.log("DB Token:", user.refreshToken);
    // console.log("Decoded:", decodedtoken);
    if (!(incomingRefreshToken === user.refreshToken)) {
      throw new ApiError(401, "refreshToken is expired or used");
    }

    const { accessToken, newrefreshToken } =
      await generateAccessTokenAndrefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          201,
          {
            accessToken,
            newrefreshToken,
          },
          "refreshToken is refreshed ",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token");
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  return res.status(203).json(new ApiResponse(203, users));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["viewer", "analyst", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true },
  ).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    message: "Role updated",
    user,
  });
});

// ✅ Update Status (Admin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true },
  ).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    message: "Status updated",
    user,
  });
});

// ✅ Delete User (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    message: "User deleted",
  });
});

export {
  registerUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  refreshUserToken,
  loginUser,
  logoutUSer,
  getAllUsers,
};
