import jwt from 'jsonwebtoken';
import User from './user.model.js';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';

// helper function to check if email is in ADMIN_EMAILS env list
const checkIsAdminEmail = (email) => {
  if (!email || !env.adminEmails) return false;
  const adminList = env.adminEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminList.includes(email.trim().toLowerCase());
};

// generate jwt auth token for a user
export const generateAuthToken = (user) => {
  const payload = {
    id: user.id || user._id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

export const getMeService = async (userId) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user.toJSON();
};

// register a new user
export const registerUser = async (userData) => {
  const { name, email, phone, password } = userData;

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    throw new ApiError(400, 'User with this phone number already exists');
  }

  const isAdmin = checkIsAdminEmail(email);

  const user = await User.create({
    name,
    email,
    phone,
    password,
    isAdmin,
  });

  const token = generateAuthToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

// login an existing user
export const loginUser = async ({ email, phone, identifier, password }) => {
  let query = {};
  if (identifier) {
    query = {
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    };
  } else if (email) {
    query = { email: email.toLowerCase() };
  } else if (phone) {
    query = { phone };
  } else {
    throw new ApiError(400, 'Email, phone, or identifier is required');
  }

  // include password field explicitly as select: false in schema
  const user = await User.findOne(query).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.password) {
    throw new ApiError(
      400,
      'This account was created via guest checkout without a password. Please set a password first.'
    );
  }

  const isMatch = await user.isPasswordMatch(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // check if user email is in admin list and promote to admin if not already
  if (user.email && checkIsAdminEmail(user.email) && !user.isAdmin) {
    user.isAdmin = true;
    await user.save();
  }

  const token = generateAuthToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

// claim guest account by setting password & email
export const claimAccountService = async (userId, { email, password }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.password) {
    throw new ApiError(400, 'Account already has a password set');
  }

  if (email && email.trim() && email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing && existing.id !== user.id) {
      throw new ApiError(400, 'This email address is already registered to another user');
    }
    user.email = cleanEmail;
  }

  if (checkIsAdminEmail(user.email)) {
    user.isAdmin = true;
  }

  user.password = password;
  await user.save();

  const token = generateAuthToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

export const getAdminUserStatsService = async () => {
  const totalUsers = await User.countDocuments();
  const registeredUsers = await User.countDocuments({ password: { $exists: true, $ne: null } });
  const guestUsers = await User.countDocuments({
    $or: [{ password: null }, { password: { $exists: false } }],
  });
  const adminUsers = await User.countDocuments({ isAdmin: true });

  const recentUsersRaw = await User.find()
    .select('+password')
    .sort({ createdAt: -1 })
    .limit(8);
  const recentUsers = recentUsersRaw.map((u) => u.toJSON());

  return {
    users: recentUsers,
    stats: {
      totalUsers,
      registeredUsers,
      guestUsers,
      adminUsers,
    },
  };
};

export const updateUserProfileService = async (userId, payload) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (payload.email && payload.email.toLowerCase() !== user.email.toLowerCase()) {
    const existingEmail = await User.findOne({
      email: payload.email.toLowerCase(),
      _id: { $ne: userId },
    });
    if (existingEmail) {
      throw new ApiError(400, 'User with this email already exists');
    }
    user.email = payload.email.toLowerCase();

    if (checkIsAdminEmail(user.email)) {
      user.isAdmin = true;
    }
  }

  if (payload.phone && payload.phone !== user.phone) {
    const existingPhone = await User.findOne({
      phone: payload.phone,
      _id: { $ne: userId },
    });
    if (existingPhone) {
      throw new ApiError(400, 'User with this phone number already exists');
    }
    user.phone = payload.phone;
  }

  if (payload.name) {
    user.name = payload.name.trim();
  }

  await user.save();
  return user.toJSON();
};

export const changeUserPasswordService = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.password) {
    if (!currentPassword) {
      throw new ApiError(400, 'Current password is required');
    }
    const isMatch = await user.isPasswordMatch(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect');
    }
  }

  user.password = newPassword;
  await user.save();
  return user.toJSON();
};


