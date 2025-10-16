const jwt = require('jsonwebtoken');

// Criamos uma função que "gera" o middleware.
// Isso nos permite passar quais 'roles' (funções) são permitidas para a rota.
// Ex: authorize(['admin']) ou authorize(['admin', 'user'])
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // 1. Pega o token do cabeçalho da requisição
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // 2. Verifica se o token é válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Anexa os dados do usuário (payload do token) à requisição
      req.user = decoded; // Agora temos req.user.id e req.user.role nos controllers

      // 4. Verifica se a 'role' do usuário está na lista de 'roles' permitidas
      // Se a lista de 'allowedRoles' estiver vazia, significa que basta estar logado.
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acesso proibido. Você não tem permissão.' });
      }
      
      // 5. Se tudo estiver OK, permite que a requisição continue
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
      }
      return res.status(401).json({ message: 'Token inválido.' });
    }
  };
};

module.exports = authorize;