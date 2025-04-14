const { dynamodb } = require("../utils/aws.helper");
const { v4: uuidv4 } = require("uuid");
const { create } = require("./blacklist.model");
require("dotenv").config();

const tableName = "users";

const UserModel = {

  /**
   * Tạo user 
   * @param {Object} userData 
   * @returns 
   */
  createUser: async (userData) => {
    const userId = uuidv4();
    const imageUrl = process.env.DEFAULT_AVT_URL;

    const params = {
      TableName: tableName,
      Item: {
        id: userId,
        username: userData.username,
        password: userData.password,
        fullname: userData.fullname,
        dob: userData.dob,
        gender: userData.gender,
        avt: imageUrl,
        status: userData.status,
        phone: userData.phone,
        created_at: new Date().toISOString(),
      },
    };

    await dynamodb.put(params).promise();
    return userData;
  },

  /**
   * Lấy thông tin user bằng username
   * @param {Object} username 
   * @returns 
   */
  getUser: async (username) => {
    const params = {
      TableName: tableName,
      IndexName: "username-index",
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
      limit: 1,
    };

    try {
      const data = await dynamodb.query(params).promise();
      return data.Items[0];

    } catch (error) {
      console.error("Error getting user: ", error);
      throw error;
    }
  },

  /**
   * Cập nhật refresh token cho user
   * @param {String} id 
   * @param {String} refreshToken 
   */
  updateRefreshToken: async (id, refreshToken) => {
    const params = {
      TableName: tableName,
      Key: {
        id,
      },
      UpdateExpression: "set refresh_token = :refreshToken",
      ExpressionAttributeValues: {
        ":refreshToken": refreshToken,
      },
    };

    await dynamodb.update(params).promise();
  },

  /**
   * Cập nhật fullname, dob, gender cho user
   * @param {Object} id 
   * @param {Object} userData 
   * @returns 
   */
  updateUser: async (id, userData) => {
    const params = {
      TableName: tableName,
      Key: {
        id,
      },
      UpdateExpression:
        "set fullname = :fullname, dob = :dob, gender = :gender",
      ExpressionAttributeValues: {
        ":fullname": userData.fullname,
        ":dob": userData.dob,
        ":gender": userData.gender,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const data = await dynamodb.update(params).promise();
      return data.Attributes;
    } catch (error) {
      console.error("Error updating user: ", error);
      throw error;
    }
  },

  /**
   * Cập nhật avt cho user
   * @param {String} id 
   * @param {String} avt 
   * @returns 
   */
  updateAvt: async (id, avt) => {
    const params = {
      TableName: tableName,
      Key: {
        id,
      },
      UpdateExpression: "set avt = :avt",
      ExpressionAttributeValues: {
        ":avt": avt,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const data = await dynamodb.update(params).promise();
      return data.Attributes;
    } catch (error) {
      console.error("Error updating user: ", error);
      throw error;
    }
  },

  /**
   * Đổi mật khẩu
   * @param {String} id 
   * @param {String} password 
   * @returns 
   */
  updatePassword: async (id, password) => {
    const params = {
      TableName: tableName,
      Key: {
        id,
      },
      UpdateExpression: "set password = :password",
      ExpressionAttributeValues: {
        ":password": password,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const data = await dynamodb.update(params).promise();
      return data.Attributes;
    } catch (error) {
      console.error("Error updating user: ", error);
      throw error;
    }
  },

  /**
   * Cập nhật OTP cho user
   * @param {String} id 
   * @param {String} otp 
   * @param {*} expiryTime 
   * @returns 
   */
  updateOTP: async (id, otp, expiryTime) => {
    const params = {
      TableName: tableName,
      Key: {
        id,
      },
      UpdateExpression: "set otp = :otp, otp_expiry_time = :otpExpiryTime",
      ExpressionAttributeValues: {
        ":otp": otp,
        ":otpExpiryTime": expiryTime,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const data = await dynamodb.update(params).promise();
      return data.Attributes;
    } catch (error) {
      console.error("Error updating OTP: ", error);
      throw error;
    }
  },

  /**
   * Xóa user
   * @param {String} id 
   */
  deleteUser: async (id) => {
    const params = {
      TableName: tableName,
      Key: {
        id,
      },
    };

    await dynamodb.delete(params).promise();
  },

  /**
   * Lấy thông tin user theo id
   * @param {String} userId 
   * @returns 
   */
  getUserById: async (userId) => {
    const params = {
      TableName: tableName,
      Key: {
        id: userId,
      },
    };

    try {
      const data = await dynamodb.get(params).promise();
      return data.Item;
    } catch (error) {
      console.error("Error getting user by id: ", error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái cho user
   * @param {String} id 
   * @param {String} status 
   * @returns 
   */
  updateUserStatus: async (id, status) => {
    const params = {
      TableName: tableName,
      Key: {
        id,
      },
      UpdateExpression: "set status = :status",
      ExpressionAttributeValues: {
        ":status": status,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const data = await dynamodb.update(params).promise();
      return data.Attributes;
    } catch (error) {
      console.error("Error updating user status: ", error);
      throw error;
    }
  }
};

module.exports = UserModel;
