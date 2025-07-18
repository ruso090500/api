const express = require('express');
const fs = require('fs').promises;
const router = express.Router();
const dbPath = './data/db.json';

router.get('/', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  res.json(data.customizationOptions);
});

router.post('/', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  const newId = data.customizationOptions.length ? Math.max(...data.customizationOptions.map(o => o.id)) + 1 : 1;
  const newOption = { ...req.body, id: newId };
  data.customizationOptions.push(newOption);
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.status(201).json(newOption);
});

router.put('/:id', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  const index = data.customizationOptions.findIndex(o => o.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Customization option not found' });
  data.customizationOptions[index] = { ...data.customizationOptions[index], ...req.body, id: parseInt(req.params.id) };
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.json(data.customizationOptions[index]);
});

router.delete('/:id', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dbPath));
  data.customizationOptions = data.customizationOptions.filter(o => o.id !== parseInt(req.params.id));
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  res.status(204).send();
});

module.exports = router;