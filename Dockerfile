# Node.js 20 Alpine tabanlı resmi imaj
FROM node:20-alpine

# Çalışma dizini
WORKDIR /app

# Bağımlılık tanımları
COPY package*.json ./
COPY scripts/ ./scripts/

# Bağımlılıkların kurulması
RUN npm install

# Uygulama kaynak kodları
COPY . .

# Dışa açılan port
EXPOSE 3000

# Başlatma komutu
CMD ["npm", "start"]
