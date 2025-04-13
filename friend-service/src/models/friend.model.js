const { dynamodb } = require("../utils/aws.helper");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const tableName = "users";

const FriendModel = {
  findUserByPhoneNumber: async (phoneNumber) => {
    const params = {
      TableName: tableName,
      FilterExpression: "phone = :phone",
      ExpressionAttributeValues: {
        ":phone": phoneNumber,
      },
    };
    try {
      const data = await dynamodb.scan(params).promise();
      return data.Items.length > 0 ? data.Items[0] : null;
    } catch (error) {
      console.error("Số điện thoại không hợp lệ");
      throw new Error("Error finding user by phone number");
    }
  },
};

module.exports = FriendModel;
