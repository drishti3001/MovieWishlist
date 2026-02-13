const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const VALID_STATUS = ["plan_to_watch", "watching", "watched"];

// ---------- CREATE MOVIE ----------
async function createItem(req, res) {
  try {
    const {
      title,
      description,
      year,
      genre,
      status,
      rating,
      posterUrl
    } = req.body || {};

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const trimmedTitle = String(title).trim();
    const trimmedDescription = String(description).trim();

    if (!trimmedTitle || !trimmedDescription) {
      return res.status(400).json({ message: 'Title and description must not be empty' });
    }

    if (rating !== undefined && (rating < 1 || rating > 10)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 10' });
    }

    if (status && !VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const movie = await prisma.item.create({
      data: {
        title: trimmedTitle,
        description: trimmedDescription,
        year: year ?? null,
        genre: genre ?? null,
        status: status ?? "plan_to_watch",
        rating: rating ?? null,
        posterUrl: posterUrl ?? null,
        userId,
      },
    });

    return res.status(201).json(movie);

  } catch (err) {
    console.error('Error in createItem handler:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// ---------- READ MOVIES ----------
async function getItems(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const items = await prisma.item.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(items);

  } catch (err) {
    console.error('Error in getItems handler:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// ---------- UPDATE MOVIE ----------
async function updateItem(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const itemId = Number(req.params.id);
    if (!itemId || Number.isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, userId },
    });

    if (!existingItem) return res.status(404).json({ message: 'Item not found' });

    const {
      title,
      description,
      year,
      genre,
      status,
      rating,
      posterUrl
    } = req.body || {};

    if (rating !== undefined && (rating < 1 || rating > 10)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 10' });
    }

    if (status && !VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await prisma.item.update({
      where: { id: itemId },
      data: {
        title,
        description,
        year,
        genre,
        status,
        rating,
        posterUrl
      },
    });

    return res.json(updated);

  } catch (err) {
    console.error('Error in updateItem handler:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// ---------- DELETE MOVIE ----------
async function deleteItem(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const itemId = Number(req.params.id);
    if (!itemId || Number.isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, userId },
    });

    if (!existingItem) return res.status(404).json({ message: 'Item not found' });

    await prisma.item.delete({ where: { id: itemId } });

    return res.json({ message: 'Movie deleted' });

  } catch (err) {
    console.error('Error in deleteItem handler:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createItem,
  getItems,
  updateItem,
  deleteItem,
};
