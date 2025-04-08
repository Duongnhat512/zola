const vonage = require('../config/vonage.config');

const from = "T1 Zola"

const vonageMethod = {
    sendOTP: async (phoneNumber, otp) => {
        const text = `Mã xác thực T1 Zola của bạn là: ${otp}`
        const formattedNumber = phoneNumber.startsWith('+') ?
            phoneNumber : `84${phoneNumber.replace(/^0/, '')}`;

            await vonage.sms.send({to: formattedNumber, from, text})
            .then(resp => { console.log('Message sent successfully'); console.log(resp); })
            .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
    }
}

module.exports = vonageMethod;