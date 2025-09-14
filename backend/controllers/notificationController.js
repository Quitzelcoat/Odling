// controllers/notificationController.js
const prisma = require('../prismaClient');

/**
 * GET /notifications
 * Authenticated - list notifications for current user (latest first)
 * Query: ?limit=40&unreadOnly=true
 */
exports.listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit || '40', 10), 200);
    const where = { userId };

    if (req.query.unreadOnly === 'true') where.read = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return res.json({ notifications });
  } catch (err) {
    console.error('listNotifications error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /notifications
 * Create a notification (server-side use). Body: { userId, type, data }
 * Authenticated — you may restrict this to internal usage only if desired.
 */
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, data } = req.body;
    if (!userId || !type)
      return res.status(400).json({ error: 'userId and type required' });

    const note = await prisma.notification.create({
      data: {
        userId,
        type,
        data: data || {},
      },
    });

    return res.status(201).json({ notification: note });
  } catch (err) {
    console.error('createNotification error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /notifications/:id/read
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const note = await prisma.notification.findUnique({ where: { id } });
    if (!note || note.userId !== userId)
      return res.status(404).json({ error: 'Notification not found' });

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return res.json({ notification: updated });
  } catch (err) {
    console.error('markAsRead error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /notifications/mark-all-read
 * Mark all notifications for current user as read
 */
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return res.json({ message: 'All marked read' });
  } catch (err) {
    console.error('markAllRead error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /notifications/:id
 * Delete a notification (user-owned)
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const note = await prisma.notification.findUnique({ where: { id } });
    if (!note || note.userId !== userId)
      return res.status(404).json({ error: 'Not found' });

    await prisma.notification.delete({ where: { id } });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteNotification error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
