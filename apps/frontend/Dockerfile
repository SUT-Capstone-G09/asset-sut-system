# ใช้ Stage เดียวโดด ๆ ไม่แยก Builder เพราะเราจะรัน Dev Mode
FROM node:20.9.0-alpine
WORKDIR /app

# ติดตั้ง Dependencies ทั้งหมด
COPY package.json package-lock.json ./
RUN npm install

# ก๊อปปี้โค้ดทั้งหมดเข้าตู้
COPY . .

# เปิดพอร์ต 3001
EXPOSE 3001

# 🚀 บังคับสั่งรันในโหมด dev โดยผูกพอร์ตเข้ากับ 3001 และเปิดรับทุกไอพี (0.0.0.0)
CMD ["npx", "next", "dev", "-p", "3001", "-H", "0.0.0.0"]