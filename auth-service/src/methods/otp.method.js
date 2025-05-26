const AWS = require('../config/aws.config');

const sns = new AWS.SNS();

const otpMethod = {
    generateOTP: () => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return otp;
    },
    sendOTP: async (phoneNumber, otp) => {

        const formattedNumber = phoneNumber.startsWith('+') ?
            phoneNumber : `${phoneNumber.replace(/^0/, '+84')}`;
        
        const params = {
            Message: `Mã OTP của bạn là: ${otp}`,
            PhoneNumber: formattedNumber,
        };

        try {
            const result = await sns.publish(params).promise();
            console.log("OTP sent:", result);
            return result;
        } catch (error) {
            console.error("Error sending OTP:", error);
            throw error;
        }
    }

}

module.exports = otpMethod;