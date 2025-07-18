const express = require('express');
const fs = require('fs').promises;
const router = express.Router();
const upload = require('../middleware/upload');
const dbPath = './data/db.json';

router.get('/', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  const { locationId } = req.query;
  if (locationId) {
    const location = data.locations.find(l => l.id === locationId);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    const menuItems = data.menuItems.filter(item => location.availableProducts.includes(item.id));
    res.json(menuItems);
  } else {
    res.json(data.menuItems);
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  const newId = data.menuItems.length ? Math.max(...data.menuItems.map(i => i.id)) + 1 : 1;
  const menuItemData = {
    ...req.body,
    id: newId,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    availableAt: req.body.availableAt ? req.body.availableAt.split(',') : []
  };
  data.menuItems.push(menuItemData);

  // Update locations with this product
  data.locations.forEach(location => {
    if (menuItemData.availableAt.includes(location.id)) {
      if (!location.availableProducts) location.availableProducts = [];
      location.availableProducts.push(newId);
    }
  });

  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.status(201).json(menuItemData);
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  const index = data.menuItems.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Menu item not found' });

  const menuItemData = {
    ...data.menuItems[index],
    ...req.body,
    id: parseInt(req.params.id),
    image: req.file ? `/uploads/${req.file.filename}` : req.body.image || data.menuItems[index].image,
    availableAt: req.body.availableAt ? req.body.availableAt.split(',') : data.menuItems[index].availableAt
  };
  data.menuItems[index] = menuItemData;

  // Update locations
  data.locations.forEach(location => {
    location.availableProducts = location.availableProducts.filter(id => id !== parseInt(req.params.id));
    if (menuItemData.availableAt.includes(location.id)) {
      location.availableProducts.push(parseInt(req.params.id));
    }
  });

  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.json(menuItemData);
});

router.delete('/:id', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  data.menuItems = data.menuItems.filter(i => i.id !== parseInt(req.params.id));
  data.locations.forEach(location => {
    location.availableProducts = location.availableProducts.filter(id => id !== parseInt(req.params.id));
  });
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.status(204).send();
});

module.exports = router;