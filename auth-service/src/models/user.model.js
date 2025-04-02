const {dynamodb} = require("../config/aws-helper");

const tableName = "users";

const UserModel = {
    createUser: async userData => {
        const params = {
            TableName: tableName,
            Item: {
                username: userData.username,
                password: userData.password,
                // fullname: userData.fullname,
                // dob: userData.dob,
                // gender: userData.gender,
                // avt: userData.avt,
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
    // updateUser: async (username, userData) => {
    //     const params = {
    //         TableName: tableName,
    //         Key: {
    //             username
    //         },
    //         UpdateExpression: "set name"
    //     }
    // }
}

module.exports = UserModel;