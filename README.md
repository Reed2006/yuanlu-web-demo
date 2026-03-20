# 缘旅 Demo Web

纯前端静态演示版本，数据全部写死在前端，无后端依赖。

## 功能

- 南京旅途首页轮播图、本地静态图片
- Mapbox 地图展示
- 5 到 10 秒旅途轨迹动画
- 南京天气固定展示：`晴 26°`
- 锚点、时空胶囊、旅记、社区、记忆页完整演示

## 本地运行

推荐 Node 20：

```bash
npm install
npm run build
npx vite
```

如果本机默认 Node 版本过高导致 Vite 原生依赖异常，可临时使用：

```bash
printf 'y\n' | npx -p node@20 node ./node_modules/vite/bin/vite.js --host
```

## 部署

仓库已适配 GitHub Pages：

- 使用 `Hash Router`
- Vite `base` 为相对路径
- Mapbox Token 通过 `VITE_MAPBOX_TOKEN` 注入
- 推送到 `main` 后通过 Actions 自动部署 Pages
