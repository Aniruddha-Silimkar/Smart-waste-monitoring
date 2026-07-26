const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_FILE = path.join(__dirname, "..", "local-users.json");

function readUsers() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }

    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Local auth store read error:", error);
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

function findUserByEmail(email) {
  return readUsers().find((user) => user.email === email) || null;
}

function findUserById(id) {
  return readUsers().find((user) => user._id === id) || null;
}

function createUser({ name, email, password }) {
  const users = readUsers();
  const now = new Date().toISOString();
  const user = {
    _id: crypto.randomUUID(),
    name,
    email,
    password,
    role: "user",
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);
  writeUsers(users);
  return user;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
