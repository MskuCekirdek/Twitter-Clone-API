# Node 20 Alpine — hızlı ve küçük image
FROM node:20-slim

# Çalışma dizini
WORKDIR /

# Paketleri önce kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install --production

# Prisma client oluşturulacak dosyalar için prisma klasörünü kopyala
COPY prisma ./prisma

# Prisma Client üret
RUN npx prisma generate

# Uygulamanın geri kalanını kopyala
COPY . .

# Express portu
EXPOSE 3001

# Sunucuyu başlat
CMD ["node", "app.js"]
