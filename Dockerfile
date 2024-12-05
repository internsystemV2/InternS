# Build stage
FROM node:16-alpine AS build

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json để cài đặt dependencies
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install --legacy-peer-deps

# Sao chép toàn bộ mã nguồn ứng dụng và file .env vào container
COPY . .

# Build ứng dụng với biến môi trường từ file .env
RUN npm run build

# Kiểm tra xem thư mục dist có tồn tại sau khi build không
RUN ls -l /app/dist

# Production stage
FROM nginx:alpine

# Thiết lập thư mục làm việc trong container Nginx
WORKDIR /usr/share/nginx/html

# Sao chép kết quả build từ bước trước vào Nginx
COPY --from=build /app/dist .


# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]