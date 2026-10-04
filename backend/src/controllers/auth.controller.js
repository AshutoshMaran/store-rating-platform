import { prisma } from "../../prisma/config.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";

export const validateUserInput = ({ name, email, password, address }) => {
  if (!name || name.trim().length < 20 || name.trim().length > 60) {
    return 'Name must be between 20 and 60 characters';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  if (!address || address.trim().length > 400) {
    return 'Address cannot exceed 400 characters';
  }
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    return 'Password must be 8-16 characters and contain at least one uppercase letter and one special character';
  }
  return null;
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Credentials required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    };

    if (user.role === 'ADMIN') {
      res.cookie("adminRefreshToken", refreshToken, cookieOptions);
      res.cookie("adminAccessToken", accessToken, cookieOptions);
    } else if (user.role === 'STORE_OWNER') {
      res.cookie("storeOwnerRefreshToken", refreshToken, cookieOptions);
      res.cookie("storeOwnerAccessToken", accessToken, cookieOptions);
    } else {
      res.cookie("userRefreshToken", refreshToken, cookieOptions);
      res.cookie("userAccessToken", accessToken, cookieOptions);
    }

    return res.status(200).json({
      message: `${user.role} logged in successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });

  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const registerController = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const validationError = validateUserInput({ name, email, password, address });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        address,
        role: role === 'STORE_OWNER' ? 'STORE_OWNER' : role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true
      }
    });

    return res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMeController = async (req, res) => {
  try {
    const requestedRole = req.query?.role ;
    let token = null;

    if (requestedRole === 'ADMIN') {
      token = req.cookies?.adminAccessToken;
    } else if (requestedRole === 'STORE_OWNER') {
      token = req.cookies?.storeOwnerAccessToken;
    } else if (requestedRole === 'USER') {
      token = req.cookies?.userAccessToken;
    } else {
      token = req.cookies?.userAccessToken || req.cookies?.adminAccessToken || req.cookies?.storeOwnerAccessToken;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, address: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const requestedRole = req.body?.role || req.query?.role ;
    let refreshToken = null;

    if (requestedRole === 'ADMIN') {
      refreshToken = req.cookies?.adminRefreshToken;
    } else if (requestedRole === 'STORE_OWNER') {
      refreshToken = req.cookies?.storeOwnerRefreshToken;
    } else if (requestedRole === 'USER') {
      refreshToken = req.cookies?.userRefreshToken;
    } else {
      refreshToken = req.cookies?.adminRefreshToken || req.cookies?.storeOwnerRefreshToken || req.cookies?.userRefreshToken;
    }

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, address: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    };

    if (user.role === 'ADMIN') {
      res.cookie("adminAccessToken", newAccessToken, cookieOptions);
    } else if (user.role === 'STORE_OWNER') {
      res.cookie("storeOwnerAccessToken", newAccessToken, cookieOptions);
    } else {
      res.cookie("userAccessToken", newAccessToken, cookieOptions);
    }

    return res.status(200).json({
      message: "Access token refreshed successfully",
      user
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const logoutController = async (req, res) => {
  const cookieOptions = { httpOnly: true, secure: false, sameSite: "lax" };
  res.clearCookie("adminAccessToken", cookieOptions);
  res.clearCookie("adminRefreshToken", cookieOptions);
  res.clearCookie("storeOwnerAccessToken", cookieOptions);
  res.clearCookie("storeOwnerRefreshToken", cookieOptions);
  res.clearCookie("userAccessToken", cookieOptions);
  res.clearCookie("userRefreshToken", cookieOptions);

  return res.status(200).json({ message: "Logged out successfully" });
};

export const updatePasswordController = async (req, res) => {
  try {
    const token = req.cookies?.adminAccessToken || req.cookies?.storeOwnerAccessToken || req.cookies?.userAccessToken;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { password } = req.body;

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be 8-16 characters and contain at least one uppercase letter and one special character'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: passwordHash }
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};