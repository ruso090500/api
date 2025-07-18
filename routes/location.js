const express = require('express');
const fs = require('fs').promises;
const router = express.Router();
const dbPath = './data/db.json';

router.get('/', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  res.json(data.locations);
});

router.post('/', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  const newLocation = {
    ...req.body,
    id: req.body.id || `sede-${Date.now()}`,
    availableProducts: req.body.availableProducts ? req.body.availableProducts.split(',').map(Number) : []
  };
  data.locations.push(newLocation);
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.status(201).json(newLocation);
});

router.put('/:id', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  const index = data.locations.findIndex(l => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Location not found' });
  data.locations[index] = {
    ...data.locations[index],
    ...req.body,
    availableProducts: req.body.availableProducts ? req.body.availableProducts.split(',').map(Number) : data.locations[index].availableProducts
  };
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.json(data.locations[index]);
});

router.delete('/:id', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  data.locations = data.locations.filter(l => l.id !== req.params.id);
  data.menuItems.forEach(item => {
    item.availableAt = item.availableAt.filter(id => id !== req.params.id);
  });
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.status(204).send();
});

module.exports = router;