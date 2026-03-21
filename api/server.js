const express = require('express');
const app = express();
app.use(express.json());

const Saque = require('../models/Saque');

// listar saques
app.get('/saques', async (req, res) => {
  res.json(await Saque.find());
});

// aprovar
app.post('/aprovar/:id', async (req, res) => {
  const s = await Saque.findById(req.params.id);
  s.status = 'aprovado';
  await s.save();
  res.send('ok');
});

// negar
app.post('/negar/:id', async (req, res) => {
  const s = await Saque.findById(req.params.id);
  s.status = 'negado';
  await s.save();
  res.send('ok');
});

app.listen(3000, () => console.log('Painel ON'));
