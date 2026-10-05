import { prisma } from '../../prisma/config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const resetPassword = async (req, res) => {
  const userId = req.user?.id;
  const { password } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      message: "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
    });
  }

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashPassword },
      select: { id: true, name: true, email: true, address: true, role: true }
    });

    return res.status(200).json({
      message: "Password updated successfully",
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllStores = async (req, res) => {
  try {
    // Check if a normal user is logged in to return their personal rating
    let currentUserId = null;
    const token = req.cookies?.userAccessToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (e) {
        // Token invalid/expired - continue without personalized rating
      }
    }

    const stores = await prisma.store.findMany({
      include: {
        ratings: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedStores = stores.map(store => {
      const totalRatings = store.ratings.length;
      const overallRating = totalRatings > 0
        ? Number((store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1))
        : 0;

      let userRating = null;
      if (currentUserId) {
        const userRatingObj = store.ratings.find(r => r.userId === currentUserId);
        if (userRatingObj) {
          userRating = userRatingObj.rating;
        }
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        totalRatings,
        userRating,
        createdAt: store.createdAt
      };
    });

    return res.status(200).json({ stores: formattedStores, message: "All Stores fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStoreDetails = async (req, res) => {
  const storeId = req.params?.storeId;
  if (!storeId) {
    return res.status(404).json({ message: "Store ID is required" });
  }

  let currentUserId = null;
  const token = req.cookies?.userAccessToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      currentUserId = decoded.userId;
    } catch (e) {
      // Ignored
    }
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        ratings: true
      }
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const totalRatings = store.ratings.length;
    const overallRating = totalRatings > 0
      ? Number((store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1))
      : 0;

    let userRating = null;
    if (currentUserId) {
      const userRatingObj = store.ratings.find(r => r.userId === currentUserId);
      if (userRatingObj) {
        userRating = userRatingObj.rating;
      }
    }

    return res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        totalRatings,
        userRating
      },
      message: "Store fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const rateStore = async (req, res) => {
  const storeId = req.params?.storeId;
  if (!storeId) {
    return res.status(400).json({ message: "Store ID is required" });
  }

  const { rating } = req.body;
  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(422).json({ message: 'Rating must be a whole number between 1 and 5' });
  }

  const userId = req.user.id;

  try {
    const isExist = await prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId } }
    });

    if (isExist) {
      const ratingUpdated = await prisma.rating.update({
        where: { userId_storeId: { userId, storeId } },
        data: { rating: numericRating }
      });

      return res.status(200).json({
        rating: ratingUpdated,
        message: "Rating updated successfully"
      });
    } else {
      const ratingCreated = await prisma.rating.create({
        data: {
          storeId,
          userId,
          rating: numericRating
        }
      });

      return res.status(200).json({
        rating: ratingCreated,
        message: "Rating submitted successfully"
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};