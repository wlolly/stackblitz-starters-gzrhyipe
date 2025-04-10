# ELEMENT-5 WMS 系统备份

此备份于 Wed 09 Apr 2025 04:13:42 AM UTC 创建。

## 备份内容
- 主要源代码目录: app components database lib middleware public services shared tools
- 配置文件: package.json drizzle.config.ts tailwind.config.ts next.config.js .env

## 恢复说明
1. 创建一个新的Next.js项目
2. 将这些文件复制到新项目中
3. 运行 `npm install` 安装依赖
4. 配置数据库连接
5. 启动应用 `npm run dev`

## 注意事项
- 请确保新环境中Node.js版本兼容
- 确保PostgreSQL数据库已正确配置
- 检查环境变量(.env)是否包含所有必要配置
