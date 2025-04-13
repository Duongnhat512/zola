require("dotenv").config();
const AWS = require("../configs/aws.config");

const s3 = new AWS.S3();

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports = { dynamodb, s3 };
