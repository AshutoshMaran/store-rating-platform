import { prisma } from '../../prisma/config.js';

export const getStoreOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.storeOwner?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Store owner not authenticated" });
    }

    const stores = await prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true, address: true }
            }
          },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    const formattedStores = stores.map(store => {
      const totalRatings = store.ratings.length;
      const averageRating = totalRatings > 0
        ? Number((store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1))
        : 0;

      const userRatings = store.ratings.map(r => ({
        id: r.id,
        rating: r.rating,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        userName: r.user.name,
        userEmail: r.user.email,
        userAddress: r.user.address
      }));

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings,
        ratings: userRatings
      };
    });

    return res.status(200).json({
      stores: formattedStores,
      message: "Owner dashboard data fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
