const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Cargar datos del menú
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "menu.json"), "utf-8")
);

// Token de admin
const ADMIN_TOKEN = "admin123";

// Middleware de autenticación admin
const authenticateAdmin = (req, res, next) => {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  next();
};

// Middleware para parsing JSON
app.use(express.json());

// ✅ Configura CORS ANTES de cualquier ruta
app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5501", 
    "http://127.0.0.1:5501",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-admin-token"],
}));

// ==================== RUTAS PÚBLICAS ====================

app.get("/", (_, res) =>
  res.json({ message: "Burger Parrillera API está funcionando 🍔" })
);

app.get("/categories", (_, res) => res.json(data.categories));

app.get("/menu", (_, res) => {
  const availableItems = data.menuItems.filter((i) => i.available !== false);
  res.json(availableItems);
});

app.get("/menu/:id", (req, res) => {
  const item = data.menuItems.find((i) => i.id === parseInt(req.params.id));
  if (!item || item.available === false) {
    return res.status(404).json({ error: "Ítem no encontrado o no disponible" });
  }
  res.json(item);
});

app.get("/menu/category/:id", (req, res) => {
  const items = data.menuItems.filter(
    (i) => i.category === req.params.id && i.available !== false
  );
  items.length
    ? res.json(items)
    : res.status(404).json({ error: "Categoría vacía o no encontrada" });
});

app.get("/customization", (_, res) => res.json(data.customizationOptions));

app.get("/sides", (_, res) => res.json(data.categorizedSides));

// ==================== RUTAS DE ADMIN ====================

// Validar token de admin
app.post("/auth/validate", (req, res) => {
  const { token } = req.body;
  if (token === ADMIN_TOKEN) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false, error: "Token inválido" });
  }
});

// Obtener todos los productos (admin)
app.get("/admin/menu", authenticateAdmin, (req, res) => {
  // Devuelve TODOS los productos para el admin (disponibles y no disponibles)
  res.json(data.menuItems);
});

// Actualizar disponibilidad de producto
app.patch("/menu/:id/availability", authenticateAdmin, (req, res) => {
  try {
    const item = data.menuItems.find((i) => i.id === parseInt(req.params.id));
    if (!item) {
      return res.status(404).json({ error: "Ítem no encontrado" });
    }

    const { available } = req.body;
    if (typeof available !== "boolean") {
      return res.status(400).json({ 
        error: 'El campo "available" debe ser booleano' 
      });
    }

    item.available = available;
    
    // Guardar cambios en el archivo
    fs.writeFileSync(
      path.join(__dirname, "data", "menu.json"),
      JSON.stringify(data, null, 2)
    );

    res.json({ 
      message: "Disponibilidad actualizada", 
      item: {
        id: item.id,
        name: item.name,
        available: item.available
      }
    });
  } catch (err) {
    console.error("Error actualizando disponibilidad:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Iniciar servidor
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);