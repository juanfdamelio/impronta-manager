import { Router, Request, Response } from 'express';
import db, { Order, NewOrder, DashboardStats } from './database';

const router = Router();

// ── GET /api/orders — List all orders (with optional status filter) ──
router.get('/orders', (req: Request, res: Response): void => {
    try {
        const { status, search } = req.query;

        let query = 'SELECT * FROM orders WHERE 1=1';
        const params: string[] = [];

        if (status && status !== 'todos') {
            query += ' AND status = ?';
            params.push(status as string);
        }

        if (search) {
            query += ' AND (client_name LIKE ? OR product LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const orders = db.prepare(query).all(...params) as Order[];
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener pedidos' });
    }
});

// ── GET /api/orders/:id — Get single order ──
router.get('/orders/:id', (req: Request, res: Response): void => {
    try {
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Order | undefined;

        if (!order) {
            res.status(404).json({ success: false, error: 'Pedido no encontrado' });
            return;
        }

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener el pedido' });
    }
});

// ── POST /api/orders — Create new order ──
router.post('/orders', (req: Request, res: Response): void => {
    try {
        const { client_name, client_phone, product, material, quantity, unit_price, notes }: NewOrder = req.body;

        // Validation
        if (!client_name || !product || !quantity || !unit_price) {
            res.status(400).json({
                success: false,
                error: 'Campos requeridos: client_name, product, quantity, unit_price'
            });
            return;
        }

        const result = db.prepare(`
            INSERT INTO orders (client_name, client_phone, product, material, quantity, unit_price, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            client_name,
            client_phone || '',
            product,
            material || 'MDF',
            quantity,
            unit_price,
            notes || ''
        );

        const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid) as Order;
        res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al crear el pedido' });
    }
});

// ── PATCH /api/orders/:id/status — Update order status ──
router.patch('/orders/:id/status', (req: Request, res: Response): void => {
    try {
        const { status } = req.body;
        const validStatuses = ['pendiente', 'en_produccion', 'completado', 'enviado'];

        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                error: `Estado inválido. Opciones: ${validStatuses.join(', ')}`
            });
            return;
        }

        const result = db.prepare(`
            UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(status, req.params.id);

        if (result.changes === 0) {
            res.status(404).json({ success: false, error: 'Pedido no encontrado' });
            return;
        }

        const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Order;
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar estado' });
    }
});

// ── PUT /api/orders/:id — Update full order ──
router.put('/orders/:id', (req: Request, res: Response): void => {
    try {
        const { client_name, client_phone, product, material, quantity, unit_price, notes } = req.body;

        const result = db.prepare(`
            UPDATE orders
            SET client_name = ?, client_phone = ?, product = ?, material = ?,
                quantity = ?, unit_price = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            client_name, client_phone || '', product, material || 'MDF',
            quantity, unit_price, notes || '', req.params.id
        );

        if (result.changes === 0) {
            res.status(404).json({ success: false, error: 'Pedido no encontrado' });
            return;
        }

        const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Order;
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar pedido' });
    }
});

// ── DELETE /api/orders/:id — Delete order ──
router.delete('/orders/:id', (req: Request, res: Response): void => {
    try {
        const result = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);

        if (result.changes === 0) {
            res.status(404).json({ success: false, error: 'Pedido no encontrado' });
            return;
        }

        res.json({ success: true, message: 'Pedido eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al eliminar pedido' });
    }
});

// ── GET /api/dashboard — Dashboard stats ──
router.get('/dashboard', (_req: Request, res: Response): void => {
    try {
        const total = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
        const pending = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pendiente'").get() as { count: number };
        const inProd = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'en_produccion'").get() as { count: number };
        const completed = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'completado'").get() as { count: number };
        const shipped = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'enviado'").get() as { count: number };

        const revenue = db.prepare('SELECT COALESCE(SUM(total_price), 0) as total FROM orders').get() as { total: number };
        const monthRevenue = db.prepare(`
            SELECT COALESCE(SUM(total_price), 0) as total FROM orders
            WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
        `).get() as { total: number };

        const avgOrder = db.prepare('SELECT COALESCE(AVG(total_price), 0) as avg FROM orders').get() as { avg: number };

        const topProducts = db.prepare(`
            SELECT product, COUNT(*) as count FROM orders
            GROUP BY product ORDER BY count DESC LIMIT 5
        `).all() as { product: string; count: number }[];

        const ordersByMonth = db.prepare(`
            SELECT
                strftime('%Y-%m', created_at) as month,
                COUNT(*) as count,
                COALESCE(SUM(total_price), 0) as revenue
            FROM orders
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6
        `).all() as { month: string; count: number; revenue: number }[];

        const stats: DashboardStats = {
            total_orders: total.count,
            pending_orders: pending.count,
            in_production: inProd.count,
            completed_orders: completed.count,
            shipped_orders: shipped.count,
            total_revenue: revenue.total,
            month_revenue: monthRevenue.total,
            avg_order_value: Math.round(avgOrder.avg),
            top_products: topProducts,
            orders_by_month: ordersByMonth.reverse()
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
});

export default router;
