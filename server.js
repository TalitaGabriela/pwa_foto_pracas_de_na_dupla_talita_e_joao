import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const upload = multer();
const app = express();

app.use(cors("http://localhost:5173")); // Permitir requisições do frontend
app.use(express.json());

// Rota para salvar foto
app.post('/', async (req, res) => {
  try {
    const { photo } = req.body;
    const newPhoto = await prisma.photo.create({ data: { photo } });
    res.json(newPhoto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar foto' });
  }
});

// Rota para buscar fotos
app.get('/', async (req, res) => {
    try {
      const photos = await prisma.photo.findMany({ orderBy: { date: 'desc' } });
      res.json(photos);
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      res.status(500).json({ error: 'Erro ao buscar fotos' });
    }
  });
  

app.listen(3000, () => console.log('🚀 Servidor rodando na porta 3000'));
