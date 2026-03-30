import Database from 'better-sqlite3';
import path from 'path';

// ── TYPES ──
export interface Order {
    id: number;
    client_name: string;
    client_phone: string;
    product: string;
    material: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    status: 'pendiente' | 'en_produccion' | 'completado' | 'enviado';
    notes: string;
    created_at: string;
    updated_at: string;
}

export type NewOrder = Omit<Order, 'id' | 'total_price' | 'status' | 'created_at' | 'updated_at'>;

export interface DashboardStats {
    total_orders: number;
    pending_orders: number;
    in_production: number;
    completed_orders: number;
    shipped_orders: number;
    total_revenue: number;
    month_revenue: number;
    avg_order_value: number;
    top_products: { product: string; count: number }[];
    orders_by_month: { month: string; count: number; revenue: number }[];
}

// ── DATABASE SETUP ──
const DB_PATH = path.join(__dirname, '..', 'data', 'impronta.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        client_phone TEXT DEFAULT '',
        product TEXT NOT NULL,
        material TEXT DEFAULT 'MDF',
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        total_price REAL GENERATED ALWAYS AS (quantity * unit_price) STORED,
        status TEXT NOT NULL DEFAULT 'pendiente'
            CHECK(status IN ('pendiente', 'en_produccion', 'completado', 'enviado')),
        notes TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
`);

export default db;
