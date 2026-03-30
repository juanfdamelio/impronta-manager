# 🔥 Impronta Manager

Sistema de gestión de pedidos para **Impronta Laser** — emprendimiento de grabado y corte láser en MDF y otros materiales.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)

---

## 📋 Sobre el proyecto

Aplicación fullstack para gestionar el flujo completo de pedidos de un negocio de grabado láser. Pensada para resolver un problema real: llevar control de pedidos que antes se manejaban por WhatsApp y anotaciones manuales.

### Funcionalidades

- **Dashboard** con estadísticas en tiempo real: ingresos totales, del mes, promedio por pedido, pedidos por estado
- **Gráficos** de pedidos por mes y ranking de productos más solicitados
- **CRUD completo** de pedidos: crear, ver, editar, eliminar
- **Flujo de estados**: Pendiente → En producción → Completado → Enviado
- **Búsqueda y filtros** por estado y por cliente/producto
- **Interfaz responsive** con diseño dark mode profesional

---

## 🛠️ Stack técnico

| Tecnología | Uso |
|---|---|
| **TypeScript** | Lenguaje principal — tipado estricto en todo el backend |
| **Express.js** | Framework HTTP — API REST |
| **better-sqlite3** | Base de datos embebida — sin configuración externa |
| **HTML/CSS/JS** | Frontend vanilla — SPA sin frameworks |

### Arquitectura

```
src/
├── server.ts      # Entry point, middleware, static files
├── routes.ts      # API endpoints (CRUD + Dashboard)
└── database.ts    # Esquema, tipos TypeScript, conexión SQLite
public/
└── index.html     # Frontend SPA completo
```

---

## 🚀 Cómo ejecutar

### Requisitos
- Node.js 18+
- npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/impronta-manager.git
cd impronta-manager

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# O compilar y ejecutar
npm run build
npm start
```

La app se abre en `http://localhost:3000`

---

## 📡 API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/orders` | Listar pedidos (filtro por `?status=` y `?search=`) |
| `GET` | `/api/orders/:id` | Obtener pedido por ID |
| `POST` | `/api/orders` | Crear nuevo pedido |
| `PUT` | `/api/orders/:id` | Actualizar pedido completo |
| `PATCH` | `/api/orders/:id/status` | Cambiar estado del pedido |
| `DELETE` | `/api/orders/:id` | Eliminar pedido |
| `GET` | `/api/dashboard` | Estadísticas del dashboard |

### Ejemplo de request

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Empresa ABC",
    "client_phone": "11-2345-6789",
    "product": "Caja MDF personalizada",
    "material": "MDF",
    "quantity": 50,
    "unit_price": 1500
  }'
```

---

## 📸 Capturas

*(Agregá capturas del dashboard y la vista de pedidos acá)*

---

## 👤 Autor

**Juan Francisco Damelio**
- [LinkedIn](https://www.linkedin.com/in/juan-francisco-damelio-9106483ba)
- [GitHub](https://github.com/tu-usuario)
- Email: dameliojuanfrancisco@gmail.com
