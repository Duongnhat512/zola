const validator = require('../utils/validator');

const validationMiddleware = {
  /**
   * Middleware validate registration
   */
  validateRegistration: (req, res, next) => {
    // Normalize phone number trước khi validate
    if (req.body.username) {
      req.body.username = validator.normalizePhone(req.body.username);
    }
    if (req.body.phone) {
      req.body.phone = validator.normalizePhone(req.body.phone);
    }

    const validation = validator.validateRegistration(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Dữ liệu không hợp lệ',
        errors: validation.errors
      });
    }
    
    next();
  },

  /**
   * Middleware validate login
   */
  validateLogin: (req, res, next) => {
    // Normalize phone number
    if (req.body.username) {
      req.body.username = validator.normalizePhone(req.body.username);
    }

    const validation = validator.validateLogin(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Dữ liệu đăng nhập không hợp lệ',
        errors: validation.errors
      });
    }
    
    next();
  },

  /**
   * Middleware validate change password
   */
  validateChangePassword: (req, res, next) => {
    const errors = [];
    
    // Validate old password
    if (!req.body.password) {
      errors.push({ field: 'password', message: 'Mật khẩu cũ không được để trống' });
    }
    
    // Validate new password
    const passwordValidation = validator.validatePassword(req.body.newPassword);
    if (!passwordValidation.isValid) {
      errors.push({ field: 'newPassword', message: passwordValidation.message });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }
    
    next();
  },

  /**
   * Middleware validate phone for OTP
   */
  validatePhoneForOTP: (req, res, next) => {
    if (req.body.username) {
      req.body.username = validator.normalizePhone(req.body.username);
    }

    const phoneValidation = validator.validatePhone(req.body.username);
    
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: phoneValidation.message
      });
    }
    
    next();
  },

  /**
   * Middleware validate reset password
   */
  validateResetPassword: (req, res, next) => {
    const errors = [];
    
    // Validate username (phone)
    if (req.body.username) {
      req.body.username = validator.normalizePhone(req.body.username);
    }
    
    const phoneValidation = validator.validatePhone(req.body.username);
    if (!phoneValidation.isValid) {
      errors.push({ field: 'username', message: phoneValidation.message });
    }
    
    // Validate new password
    const passwordValidation = validator.validatePassword(req.body.newPassword);
    if (!passwordValidation.isValid) {
      errors.push({ field: 'newPassword', message: passwordValidation.message });
    }
    
    // Validate OTP
    if (!req.body.otp) {
      errors.push({ field: 'otp', message: 'Mã OTP không được để trống' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }
    
    next();
  }
};

module.exports = validationMiddleware;