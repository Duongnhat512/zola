require("dotenv").config();
const { s3 } = require("../utils/aws.helper");

const randomString = numberCharacter => {
    return `${Math.random()
        .toString(36)
        .substring(2, numberCharacter + 2)
        }`
};

const FILE_TYPE_MATCH = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "video/mp3",
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
    "video/mkv",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.rar",
    "application/zip",
]

const uploadFile = async file => {
    const filePath = `file/${randomString(4)}-${new Date().getTime()}-${file?.originalname}`;

    if (FILE_TYPE_MATCH.indexOf(file.mimetype) === -1) {
        throw new Error(`File type ${file.originalname} is not supported`);
    }

    const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Body: file?.buffer,
        Key: filePath,
        ContentType: file?.mimetype,
    }

    try {
        const data = await s3.upload(uploadParams).promise();

        console.log(`File uploaded successfully. File URL: ${data.Location}`);

        const fileName = `${process.env.CLOUD_FRONT_URL}/${data.Key}`;

        return fileName;
    } catch (error) {
        console.error("Error uploading file: ", error);
        throw error;
    }
}

module.exports = {
    uploadFile
}
