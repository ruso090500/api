const express = require('express');
const fs = require('fs').promises;
const router = express.Router();
const dbPath = './data/db.json';

router.get('/', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  res.json(data.categories);
});

router.post('/', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  const newCategory = { ...req.body, id: String(Date.now()) }; // Generate unique ID
  data.categories.push(newCategory);
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.status(201).json(newCategory);
});

router.put('/:id', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  const index = data.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Category not found' });
  data.categories[index] = { ...data.categories[index], ...req.body };
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.json(data.categories[index]);
});

router.delete('/:id', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  data.categories = data.categories.filter(c => c.id !== req.params.id);
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.status(204).send();
});

module.exports = router;