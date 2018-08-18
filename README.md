### 修改配置

```
cp .env.example .env
# 修改.env中的配置
vim .env
```

### 开发环境

```
# 使用nodemon实现代码改动自动启动服务器
npm run dev

# 如果不需要自动重启
npm start
```

### 生产环境

```
npm run compile
pm2 start process.json
# OR
npm run start
```
