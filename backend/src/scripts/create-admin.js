// Importa o pool de conexão do banco de dados e o userModel
const db = require('../models/db');
const userModel = require('../models/userModel');

// Função principal assíncrona
const createAdmin = async () => {
  console.log('Iniciando script de criação de administrador...');

  try {
    // Pega os argumentos passados pela linha de comando
    const [name, email, password] = process.argv.slice(2);

    if (!name || !email || !password) {
      console.error('ERRO: Por favor, forneça nome, email e senha como argumentos.');
      console.log('Exemplo: node src/scripts/create-admin.js "Nome do Admin" admin@email.com senha_forte');
      return;
    }

    console.log(`Verificando se o email "${email}" já existe...`);
    const existingUser = await userModel.findByEmail(email);

    if (existingUser) {
      console.error(`ERRO: O email "${email}" já está cadastrado.`);
      return;
    }

    console.log('Criando novo usuário administrador...');
    const newUser = await userModel.create({
      name,
      email,
      password,
      role: 'admin', // Define o tipo como 'admin'
      is_active: true,
    });

    console.log('-----------------------------------------');
    console.log('🎉 Administrador criado com sucesso! 🎉');
    console.log('-----------------------------------------');
    console.log(`ID: ${newUser.id}`);
    console.log(`Nome: ${newUser.name}`);
    console.log(`Email: ${newUser.email}`);
    console.log(`Tipo: ${newUser.role}`);
    console.log('-----------------------------------------');

  } catch (error) {
    console.error('Ocorreu um erro inesperado durante a criação do administrador:', error);
  } finally {
    // Garante que a conexão com o banco seja encerrada
    await db.pool.end();
    console.log('Conexão com o banco de dados encerrada.');
  }
};

// Executa a função
createAdmin();