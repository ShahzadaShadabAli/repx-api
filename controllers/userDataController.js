import UserData from '../models/userData.js';

// Create new userData
export const createUserData = async (req, res) => {
  try {
    const userData = new UserData(req.body);
    await userData.save();
    res.status(201).json(userData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all userData
export const getAllUserData = async (req, res) => {
  try {
    const data = await UserData.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get userData by ID
export const getUserDataById = async (req, res) => {
  try {
    const data = await UserData.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update userData by ID
export const updateUserData = async (req, res) => {
  try {
    const data = await UserData.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete userData by ID
export const deleteUserData = async (req, res) => {
  try {
    const data = await UserData.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find userData by clerkUserId
export const findUserDataByClerkUserId = async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const user = await UserData.findOne({ clerkUserId });
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 