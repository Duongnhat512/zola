const { dynamodb } = require("../utils/aws.helper");
require("dotenv").config();

const tableName = "users";

const UserModel = {
    createUser: async userData => {
        const imageUrl = process.env.DEFAULT_AVT_URL;
        const params = {
            TableName: tableName,
            Item: {
                username: userData.username,
                password: userData.password,
                fullname: userData.fullname,
                dob: userData.dob,
                gender: userData.gender,
                avt: imageUrl,
                status: userData.status,
            }
        };

        await dynamodb.put(params).promise();
        return userData;
    },
    getUser: async username => {
        const params = {
            TableName: tableName,
            Key: {
                username
            }
        };

        const data = await dynamodb.get(params).promise();
        return data.Item;
    },
    updateRefreshToken: async (username, refreshToken) => {
        const params = {
            TableName: tableName,
            Key: {
                username
            },
            UpdateExpression: "set refreshToken = :refreshToken",
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
            UpdateExpression: "set fullname = :fullname",
            ExpressionAttributeValues: {
                ":fullname": userData.fullname,
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
            UpdateExpression: "set otp = :otp, otpExpiryTime = :otpExpiryTime",
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