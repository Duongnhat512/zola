const { dynamodb } = require("../utils/aws.helper");
const { v4: uuidv4 } = require("uuid");
const { create } = require("./blacklist.model");
require("dotenv").config();

const tableName = "users";

const UserModel = {
    createUser: async userData => {
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
            }
        };

        await dynamodb.put(params).promise();
        return userData;
    },
    getUser: async username => {
        const params = {
            TableName: tableName,
            IndexName: "username-index",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username
            },
            limit: 1
        };

        const data = await dynamodb.query(params).promise();
        return data.Items[0];
    },
    updateRefreshToken: async (id, refreshToken) => {
        const params = {
            TableName: tableName,
            Key: {
                id
            },
            UpdateExpression: "set refresh_token = :refreshToken",
            ExpressionAttributeValues: {
                ":refreshToken": refreshToken
            }
        };

        await dynamodb.update(params).promise();
    },
    updateUser: async (username, userData) => {
        const params = {
            TableName: tableName,
            Key: {
                username
            },
            UpdateExpression: "set fullname = :fullname, dob = :dob, gender = :gender",
            ExpressionAttributeValues: {
                ":fullname": userData.fullname,
                ":dob": userData.dob,
                ":gender": userData.gender
            },
            ReturnValues: "ALL_NEW",
        }
    
        try {
            const data = await dynamodb.update(params).promise();
            return data.Attributes;
        }
        catch (error) {
            console.error("Error updating user: ", error);
            throw error;
        }
    },
    updateAvt: async (username, avt) => {
        const params = {
            TableName: tableName,
            Key: {
                username
            },
            UpdateExpression: "set avt = :avt",
            ExpressionAttributeValues: {
                ":avt": avt
            },
            ReturnValues: "ALL_NEW",
        }

        try {
            const data = await dynamodb.update(params).promise();
            return data.Attributes;
        }
        catch (error) {
            console.error("Error updating user: ", error);
            throw error;
        }
    },
    updatePassword: async (username, password) => {
        const params = {
            TableName: tableName,
            Key: {
                username
            },
            UpdateExpression: "set password = :password",
            ExpressionAttributeValues: {
                ":password": password
            },
            ReturnValues: "ALL_NEW",
        }

        try {
            const data = await dynamodb.update(params).promise();
            return data.Attributes;
        }
        catch (error) {
            console.error("Error updating user: ", error);
            throw error;
        }
    },
    updateOTP: async (username, otp, expiryTime) => {
        const params = {
            TableName: tableName,
            Key: {
                username
            },
            UpdateExpression: "set otp = :otp, otp_expiry_time = :otpExpiryTime",
            ExpressionAttributeValues: {
                ":otp": otp,
                ":otpExpiryTime": expiryTime
            },
            ReturnValues: "ALL_NEW",
        }

        try {
            const data = await dynamodb.update(params).promise();
            return data.Attributes;
        }
        catch (error) {
            console.error("Error updating OTP: ", error);
            throw error;
        }
    },
    deleteUser: async username => {
        const params = {
            TableName: tableName,
            Key: {
                username
            }
        };

        await dynamodb.delete(params).promise();
    },
}

module.exports = UserModel;