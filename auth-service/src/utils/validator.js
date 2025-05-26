const validator = {
  // Regex cho số điện thoại Việt Nam (chính xác hơn)
  // Bao gồm: 03, 05, 07, 08, 09 + 8 số hoặc +84 + đầu số + 8 số
  vietnamPhone: /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/,
  
  // Password: >8 ký tự, có chữ và số, có thể có ký tự đặc biệt
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&.#_-]{8,}$/,
  
  // Họ tên tiếng Việt (có dấu)
  vietnameseName: /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂĐĨŨƠẶẾỤƯăđĩũơưặếụưýỵỹỳÝỴỸỲ\s]{2,50}$/,
  
  // Email
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Ngày sinh (DD/MM/YYYY hoặc YYYY-MM-DD)
  dateOfBirth: /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/,

  /**
   * Validate số điện thoại Việt Nam
   * @param {string} phone 
   * @returns {object}
   */
  validatePhone: (phone) => {
    if (!phone) {
      return { isValid: false, message: "Số điện thoại không được để trống" };
    }
    
    if (!validator.vietnamPhone.test(phone)) {
      return { 
        isValid: false, 
        message: "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (VD: 0987654321, +84987654321)" 
      };
    }
    
    return { isValid: true, message: "Số điện thoại hợp lệ" };
  },

  /**
   * Validate mật khẩu: >8 ký tự, có chữ và số, có thể có ký tự đặc biệt
   * @param {string} password 
   * @returns {object}
   */
  validatePassword: (password) => {
    if (!password) {
      return { isValid: false, message: "Mật khẩu không được để trống" };
    }

    if (password.length <= 8) {
      return { 
        isValid: false, 
        message: "Mật khẩu phải có nhiều hơn 8 ký tự" 
      };
    }

    if (!validator.password.test(password)) {
      return { 
        isValid: false, 
        message: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số" 
      };
    }
    
    return { isValid: true, message: "Mật khẩu hợp lệ" };
  },

  /**
   * Validate họ tên
   * @param {string} fullname 
   * @returns {object}
   */
  validateFullname: (fullname) => {
    if (!fullname) {
      return { isValid: false, message: "Họ tên không được để trống" };
    }
    
    if (fullname.trim().length < 2) {
      return { isValid: false, message: "Họ tên phải có ít nhất 2 ký tự" };
    }
    
    if (!validator.vietnameseName.test(fullname.trim())) {
      return { 
        isValid: false, 
        message: "Họ tên chỉ được chứa chữ cái tiếng Việt và khoảng trắng" 
      };
    }
    
    return { isValid: true, message: "Họ tên hợp lệ" };
  },

  /**
   * Validate email
   * @param {string} email 
   * @returns {object}
   */
  validateEmail: (email) => {
    if (!email) {
      return { isValid: false, message: "Email không được để trống" };
    }
    
    if (!validator.email.test(email)) {
      return { isValid: false, message: "Email không hợp lệ" };
    }
    
    return { isValid: true, message: "Email hợp lệ" };
  },

  /**
   * Validate ngày sinh: phải >13 tuổi
   * @param {string} dob 
   * @returns {object}
   */
  validateDateOfBirth: (dob) => {
    if (!dob) {
      return { isValid: false, message: "Ngày sinh không được để trống" };
    }
    
    if (!validator.dateOfBirth.test(dob)) {
      return { 
        isValid: false, 
        message: "Ngày sinh không hợp lệ. Vui lòng nhập định dạng DD/MM/YYYY hoặc YYYY-MM-DD" 
      };
    }
    
    // Kiểm tra tuổi phải >13
    const today = new Date();
    let birthDate;
    
    if (dob.includes('/')) {
      const [day, month, year] = dob.split('/');
      birthDate = new Date(year, month - 1, day);
    } else {
      birthDate = new Date(dob);
    }
    
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age <= 13) {
      return { isValid: false, message: "Bạn phải trên 13 tuổi để đăng ký" };
    }
    
    if (age > 100) {
      return { isValid: false, message: "Ngày sinh không hợp lệ" };
    }
    
    return { isValid: true, message: "Ngày sinh hợp lệ" };
  },

  /**
   * Validate giới tính
   * @param {string} gender 
   * @returns {object}
   */
  validateGender: (gender) => {
    const validGenders = ['male', 'female', 'other', 'nam', 'nữ', 'khác'];
    
    if (!gender) {
      return { isValid: false, message: "Giới tính không được để trống" };
    }
    
    if (!validGenders.includes(gender.toLowerCase())) {
      return { 
        isValid: false, 
        message: "Giới tính phải là: male, female, other hoặc nam, nữ, khác" 
      };
    }
    
    return { isValid: true, message: "Giới tính hợp lệ" };
  },

  /**
   * Validate toàn bộ data đăng ký
   * @param {object} userData 
   * @returns {object}
   */
  validateRegistration: (userData) => {
    const errors = [];
    
    // Validate username (số điện thoại)
    const phoneValidation = validator.validatePhone(userData.username);
    if (!phoneValidation.isValid) {
      errors.push({ field: 'username', message: phoneValidation.message });
    }
    
    // Validate password
    const passwordValidation = validator.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      errors.push({ field: 'password', message: passwordValidation.message });
    }
    
    // Validate fullname
    const fullnameValidation = validator.validateFullname(userData.fullname);
    if (!fullnameValidation.isValid) {
      errors.push({ field: 'fullname', message: fullnameValidation.message });
    }
    
    // Validate dob (bắt buộc)
    const dobValidation = validator.validateDateOfBirth(userData.dob);
    if (!dobValidation.isValid) {
      errors.push({ field: 'dob', message: dobValidation.message });
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Validate data đăng nhập
   * @param {object} loginData 
   * @returns {object}
   */
  validateLogin: (loginData) => {
    const errors = [];
    
    // Validate username
    const phoneValidation = validator.validatePhone(loginData.username);
    if (!phoneValidation.isValid) {
      errors.push({ field: 'username', message: phoneValidation.message });
    }
    
    // Validate password
    if (!loginData.password) {
      errors.push({ field: 'password', message: 'Mật khẩu không được để trống' });
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Normalize số điện thoại về format chuẩn
   * @param {string} phone 
   * @returns {string}
   */
  normalizePhone: (phone) => {
    if (!phone) return phone;
    
    // Loại bỏ khoảng trắng và ký tự đặc biệt
    let normalized = phone.replace(/[\s\-\(\)]/g, '');
    
    // Chuyển +84 thành 0
    if (normalized.startsWith('+84')) {
      normalized = '0' + normalized.substring(3);
    } else if (normalized.startsWith('84')) {
      normalized = '0' + normalized.substring(2);
    }
    
    return normalized;
  }
};

module.exports = validator;
