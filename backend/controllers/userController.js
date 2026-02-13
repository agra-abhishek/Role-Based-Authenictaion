const User = require("../models/User");

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  if (req.user.role !== "admin" && req.user.id !== user._id.toString())
    return res.status(403).json({ message: "Access denied" });

  res.json(user);
};

const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (req.user.role !== "admin" && req.user.id !== user._id.toString())
    return res.status(403).json({ message: "Access denied" });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  await user.save();
  res.json({ message: "Updated successfully" });
};

const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
