const userSocketMap = new Map();
const onlineUsers = new Set();

/**
 * Thêm user vào danh sách online
 * @param {string} userId ID của user
 * @param {string} socketId ID của socket connection
 */
function addUser(userId, socketId) {
  userSocketMap.set(userId, socketId);
  onlineUsers.add(userId);
}

/**
 * Xóa user khỏi danh sách online
 * @param {string} userId ID của user
 */
function removeUser(userId) {
  userSocketMap.delete(userId);
  onlineUsers.delete(userId);
}

/**
 * Kiểm tra user có online không
 * @param {string} userId ID của user
 * @returns {boolean} true nếu user online
 */
function isUserOnline(userId) {
  return userSocketMap.has(userId);
}

/**
 * Lấy socket ID của user
 * @param {string} userId ID của user
 * @returns {string|undefined} Socket ID của user hoặc undefined
 */
function getUserSocketId(userId) {
  return userSocketMap.get(userId);
}

/**
 * Lấy danh sách tất cả user đang online
 * @returns {Array} Mảng các user ID đang online
 */
function getAllOnlineUsers() {
  return Array.from(onlineUsers);
}

module.exports = {
  userSocketMap,
  onlineUsers,
  addUser,
  removeUser,
  isUserOnline,
  getUserSocketId,
  getAllOnlineUsers
};