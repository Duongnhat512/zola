const client = require("../config/twilio.config")

module.exports = {
    sendOTP: async (phoneNumber, otp) => {
        try {
            const formattedPhoneNumber = phoneNumber.startsWith('+') ?
                phoneNumber : `+84${phoneNumber.replace(/^0/, '')}`;
            const message = await client.messages.create({
                body: `Mã xác thực của bạn là: ${otp}`,
                from: twilioPhoneNumber,
                to: formattedPhoneNumber,
            });
            return message.sid;
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    },
};