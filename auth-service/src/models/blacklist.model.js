const { dynamodb } = require('../utils/aws.helper');

const tableName = 'blacklist';

const BlackList = {
    create: async (token) => {
        const createdAt = new Date().toISOString();
        const params = {
            TableName: tableName,
            Item: {
                token,
                createdAt,
            },
        };

        await dynamodb.put(params).promise();
    },
    find: async (token) => {
        const params = {
            TableName: tableName,
            Key: {
                token,
            },
        };

        const data = await dynamodb.get(params).promise();
        return data.Item;
    },
}

module.exports = BlackList;