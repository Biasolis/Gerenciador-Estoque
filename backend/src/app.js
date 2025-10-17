const express = require('express');
const cors = require('cors');

// Importa nossas rotas
const authRoutes = require('./routes/authRoutes');
const sectorRoutes = require('./routes/sectorRoutes');
const personRoutes = require('./routes/personRoutes');
const productRoutes = require('./routes/productRoutes');
const stockRoutes = require('./routes/stockRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const profileRoutes = require('./routes/profileRoutes'); // <-- Importa as novas rotas de perfil

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota "health check"
app.get('/', (req, res) => {
  res.json({ message: 'API de Gerenciamento de Estoque está funcionando!' });
});

// Registra as rotas
app.use('/api/auth', authRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/people', personRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/users', userRoutes); // Gestão de usuários (Admin)
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoutes); // <-- Registra as rotas de perfil

module.exports = app;