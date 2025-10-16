# --- Estágio 1: Build ---
# Usa uma imagem Node.js leve baseada em Alpine Linux
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de definição de dependências
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm install --production

# Copia o restante do código da aplicação
COPY . .

# --- Estágio 2: Produção ---
# Usa uma imagem ainda mais leve apenas com o Node.js runtime
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia as dependências já instaladas do estágio de build
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copia o código da aplicação do estágio de build
COPY --from=builder /usr/src/app ./

# Expõe a porta em que a aplicação vai rodar
EXPOSE 3001

# Comando para iniciar a aplicação em produção
CMD [ "node", "src/server.js" ]