// Importa a aplicação configurada do app.js
const app = require('./app');
// Importa nosso módulo de conexão com o banco
const db = require('./models/db');

// Carrega as variáveis de ambiente
require('dotenv').config();

// Define a porta
const PORT = process.env.PORT || 3001;

// Função assíncrona para iniciar o servidor
const startServer = async () => {
  try {
    // Tenta fazer uma query simples para testar a conexão
    await db.query('SELECT NOW()');
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Se a conexão for bem-sucedida, inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}. Acesse em http://localhost:${PORT}`);
    });
  } catch (error) {
    // Se a conexão falhar, exibe o erro e encerra o processo
    console.error('Não foi possível conectar ao banco de dados:', error);
    process.exit(1); // Encerra a aplicação com um código de erro
  }
};

// Chama a função para iniciar o servidor
startServer();