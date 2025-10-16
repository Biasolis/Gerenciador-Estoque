# --- Estágio 1: Build (Construção do App React) ---
# Usamos 'as builder' para nomear este estágio
FROM node:18-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Copia o restante do código-fonte do frontend
COPY . .

# Executa o build de produção do Vite
RUN npm run build

# --- Estágio 2: Serve (Servidor Web Nginx) ---
# Usa uma imagem oficial e super leve do Nginx
FROM nginx:stable-alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa configuração personalizada para o Nginx (criaremos este arquivo a seguir)
COPY nginx.conf /etc/nginx/conf.d

# Copia os arquivos estáticos gerados no estágio de build para o diretório que o Nginx serve
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx
EXPOSE 80

# O Nginx inicia automaticamente, então o CMD não é necessário