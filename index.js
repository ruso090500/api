const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const categoryRoutes = require("./routes/categories");
const menuItemRoutes = require("./routes/menuItems");
const customizationOptionRoutes = require("./routes/customizationOptions");
const locationRoutes = require("./routes/location");
const adminRoutes = require("./routes/admin");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Serve static files from public directory
app.use(express.static("public"));

app.use("/api/categories", categoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/customization-options", customizationOptionRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
