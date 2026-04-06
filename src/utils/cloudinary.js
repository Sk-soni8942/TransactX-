import { v2 as cloudinary } from "cloudinary";
import { response } from "express";

import fs from "fs"; // file system present in node js
import { ApiResponse } from "./ApiResponse.js";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudiniary
    const response1 = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    console.log(response1);

    return response1;
  } catch (error) {
    console.log("erorr on uploading ", error);
    return null;
  }
};
const deleteImage = async (public_id) => {
  try {
    const response = await cloudinary.uploader.destroy(public_id);

    console.log(response);

    if (response.result !== "ok" && response.result !== "not found") {
      throw new ApiError(400, "Something went wrong, file not deleted!");
    }

    return response;
  } catch (error) {
    throw new ApiError(400, "File not deleted!", error);
  }
};

export { uploadOnCloudinary, deleteImage };
