# yuanlu-web

这个仓库现在同时支持两种运行方式：

- 联调模式：前端连接 `yuanlu-backend`
- 演示模式：纯前端静态部署，全部数据走本地 demo 数据

## 技术栈

- React + Vite
- Tailwind CSS v4
- React Router Hash Router
- react-map-gl / Mapbox

## 联调模式

后端：

```bash
cd ../yuanlu-backend
source .venv/bin/activate
uvicorn main:app --reload
```

前端：

```bash
cd /Users/air/Yuanlvji/yuanlu-web
npm install
VITE_API_BASE=http://127.0.0.1:8000 npm run dev
```

默认前端地址：`http://127.0.0.1:4173`

## 纯前端演示模式

本地直接启动演示版：

```bash
cd /Users/air/Yuanlvji/yuanlu-web
npm install
VITE_DEFAULT_DEMO_MODE=1 npm run dev
```

演示模式下：

- API 请求会被 `src/app/lib/demoApi.ts` 拦截
- 首次打开会自动写入 demo 用户和引导状态
- 即使没有后端，也能直接进入主界面

## 地图 Token 安全边界

纯前端部署时，真正的私密 key 不能放进仓库，也不能放进浏览器端代码。

- 可以安全做到：不提交任何私密密钥，不在仓库中硬编码 token
- 不能同时做到：让浏览器端地图正常显示且 token 完全不可见

如果需要地图正常显示，请使用 Mapbox 的受限公开 token，并在 GitHub 仓库的 Actions Secret 中配置：

```bash
VITE_MAPBOX_TOKEN
```

建议同时在 Mapbox 控制台限制：

- Allowed URLs 只允许你的 GitHub Pages 域名
- 只开放需要的样式和 API 能力
- 不要把 secret token 或管理 token 放到前端

如果不配置 `VITE_MAPBOX_TOKEN`，项目仍可部署，但地图区域会进入无 token 的降级展示。

## 部署到独立 GitHub 仓库

这个目录当前挂着别的 Git 远端，不建议直接改 remote。正确做法是复制一份干净前端再初始化新的 Git 仓库。

复制代码：

```bash
cd /Users/air/Yuanlvji/yuanlu-web
./scripts/export-github-demo.sh ../yuanlu-web-github-demo
```

初始化新的 Git 仓库并上传：

```bash
cd /Users/air/Yuanlvji/yuanlu-web-github-demo
git init
git add .
git commit -m "initial demo frontend"
gh repo create yuanlu-web-demo --private --source=. --remote=origin --push
```

如果你要直接启用 GitHub Pages：

1. 在新仓库 `Settings -> Pages` 中将 source 设为 `GitHub Actions`
2. 在新仓库 `Settings -> Secrets and variables -> Actions` 中添加 `VITE_MAPBOX_TOKEN`（可选）
3. 推送到 `main` 或 `master` 后，`.github/workflows/deploy-pages.yml` 会自动部署

## 现有后端接口

- `/travel/start`
- `/travel/location`
- `/travel/end`
- `/travel/{travel_id}`
- `/travel/{travel_id}/locations`
- `/travel/{travel_id}/anchors`
- `/travel/anchor/{anchor_id}`
- `/travel/{travel_id}/diary`
- `/travel/list`
- `/travel/anchor/manual`
- `/capsule/create`
- `/capsule/nearby`
- `/capsule/mine`
- `/capsule/{capsule_id}`
- `/capsule/verify`
- `/capsule/echo`
- `/bottle/throw`
- `/bottle/receive`
- `/bottle/trajectory/{bottle_id}`
- `/bottle/mine`
- `/export/map`
- `/export/notebook`
- `/export/status/{task_id}`
- `/notifications/unread`
- `/agent/status`
- `/map/context`
- `/community/health`
- `/community/heatmap`
- `/community/posts`
- `/community/posts/{post_id}`
- `/community/posts/{post_id}/like`
