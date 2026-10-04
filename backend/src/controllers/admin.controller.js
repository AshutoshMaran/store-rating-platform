import { prisma } from '../../prisma/config.js';
import bcrypt from 'bcryptjs';
import { validateUserInput } from './auth.controller.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count()
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalStores,
        totalRatings
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addAdmin = async (req, res) => {
  const { name, email, password, address } = req.body;

  const validationError = validateUserInput({ name, email, password, address });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const isExists = await prisma.user.findUnique({ where: { email } });
  if (isExists) {
    return res.status(409).json({ message: "Record already exists with this email" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        address,
        role: 'ADMIN'
      },
      select: { id: true, name: true, email: true, address: true, role: true }
    });

    return res.status(200).json({ admin: newAdmin, message: "Admin created successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const addUser = async (req, res) => {
  const { name, email, password, address } = req.body;

  const validationError = validateUserInput({ name, email, password, address });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    return res.status(409).json({ message: "User already exists with this email" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        address,
        role: 'USER'
      },
      select: { id: true, name: true, email: true, address: true, role: true }
    });

    return res.status(200).json({ user: newUser, message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addStoreOwner = async (req, res) => {
  const { name, email, password, address } = req.body;

  const validationError = validateUserInput({ name, email, password, address });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    return res.status(409).json({ message: "Store-owner already exists with this email" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const newStoreOwner = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        address,
        role: 'STORE_OWNER'
      },
      select: { id: true, name: true, email: true, address: true, role: true }
    });

    return res.status(200).json({ storeOwner: newStoreOwner, message: "Store-Owner created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        stores: {
          include: {
            ratings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => {
      let storeRating = null;
      if (user.role === 'STORE_OWNER') {
        const allRatings = user.stores?.flatMap(s => s.ratings) || [];
        if (allRatings.length > 0) {
          storeRating = Number((allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length).toFixed(1));
        } else {
          storeRating = 0;
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        storeRating,
        stores: user.stores?.map(s => ({ id: s.id, name: s.name })),
        createdAt: user.createdAt
      };
    });

    return res.status(200).json({ users: formattedUsers, message: "All users fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addStore = async (req, res) => {
  const { name, email, address, ownerId } = req.body;

  if (!name || !email || !address) {
    return res.status(400).json({ message: "Missing required store data (name, email, address)" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: "Please provide a valid store email" });
  }

  if (address.length > 400) {
    return res.status(400).json({ message: "Store address cannot exceed 400 characters" });
  }

  try {
    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: ownerId || null
      },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });

    return res.status(200).json({ store, message: "Store added successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllStores = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        ratings: true,
        owner: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedStores = stores.map(store => {
      const totalRatings = store.ratings.length;
      const overallRating = totalRatings > 0
        ? Number((store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1))
        : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        owner: store.owner,
        overallRating,
        totalRatings,
        createdAt: store.createdAt
      };
    });

    return res.status(200).json({ stores: formattedStores, message: "All Stores fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllRatings = async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ ratings, message: "All Ratings fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  const userId = req.params?.userId;
  if (!userId) {
    return res.status(404).json({ message: "userId not found" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stores: {
          include: { ratings: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let storeRating = null;
    if (user.role === 'STORE_OWNER') {
      const allRatings = user.stores?.flatMap(s => s.ratings) || [];
      if (allRatings.length > 0) {
        storeRating = Number((allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length).toFixed(1));
      } else {
        storeRating = 0;
      }
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        storeRating,
        stores: user.stores
      },
      message: "User fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStoreDetails = async (req, res) => {
  const storeId = req.params?.storeId;
  if (!storeId) {
    return res.status(404).json({ message: "storeId not found" });
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        ratings: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const totalRatings = store.ratings.length;
    const overallRating = totalRatings > 0
      ? Number((store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1))
      : 0;

    return res.status(200).json({
      store: {
        ...store,
        overallRating,
        totalRatings
      },
      message: "Store fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const assignOwner = async (req, res) => {
  const storeId = req.params?.storeId;
  if (!storeId) {
    return res.status(400).json({ message: "Store ID is required" });
  }

  const { ownerId } = req.body;
  if (!ownerId) {
    return res.status(400).json({ message: "Owner ID is required" });
  }

  try {
    // Verify owner exists and is STORE_OWNER
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return res.status(404).json({ message: "Owner user not found" });
    }
    if (owner.role !== 'STORE_OWNER') {
      return res.status(400).json({ message: "Selected user is not a Store Owner" });
    }

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { ownerId },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });

    return res.status(200).json({ store: updatedStore, message: "Store owner assigned successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};