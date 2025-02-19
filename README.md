# 校园安全管理系统

基于 Vue 3 + Element Plus 的校园安全管理系统前端项目。

## 在线预览

[点击预览](https://topskys.github.io/video-management-system)

## 功能特性

- 视频监控：实时监控、录像回放
- 车辆管理：车辆监控、车辆登记
- 门禁管理：门禁监控、门禁控制
- 报警管理：实时报警、历史记录
- 系统管理：用户管理、角色权限、系统设置

## 技术栈

- Vue 3
- Vue Router
- Element Plus
- Mock.js
- Vite

## 开发环境

- Node.js >= 16
- npm >= 8

## 安装运行

```bash
# 克隆项目
git clone https://github.com/Topskys/video-management-system.git

# 进入项目目录
cd video-management-system

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 自动部署

项目使用 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 main 分支会自动触发部署
2. 构建产物会被部署到 gh-pages 分支
3. 可以通过 GitHub Pages 访问部署后的页面

## 项目结构

```
src/
├── assets/        # 静态资源
├── components/    # 公共组件
├── mock/         # Mock 数据
├── router/       # 路由配置
├── views/        # 页面组件
└── App.vue       # 根组件
```

## 浏览器支持

- Chrome
- Firefox
- Safari
- Edge

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (git checkout -b feature/AmazingFeature)
3. 提交你的更改 (git commit -m 'Add some AmazingFeature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 打开一个 Pull Request

## 开源协议

[MIT License](LICENSE)
