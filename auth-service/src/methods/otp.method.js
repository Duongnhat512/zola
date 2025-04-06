
module.exports = {
    generateOTP: (length = 6) => {
        let otp = "";
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10).toString();
        }
        return otp;
    },
    isOTPExpired: (expiryTime) => {
        const currentTime = new Date().getTime();
        return currentTime > expiryTime;
    }
}