# 曾家琛的个人主页

中英文个人主页，采用传统学术主页的单栏文字布局。资料来自用户提供的简历，研究方向按本人补充设为医学影像。导航仅保留首页、项目与研究、个人生活。

## 技术结构

- React + Vite 前端，响应式布局、独立内容页面、中英文切换、原生详情展开及邮件链接。
- 首页包含联系方式、教育背景、技能、获奖及证书；项目页展示研究方向与真实项目；个人生活页展示旅行图文记录，目前为空。
- 语言切换保留当前页面。语言与页面编码在 URL 中，如 `#/en/research`，可以直接分享或刷新；浏览器会记住上次选择的语言。
- 默认是可部署到 GitHub Pages 的静态网站：`data/profile.json` 在构建时作为静态 JSON 资源打包，浏览器不依赖 Go API。
- Go 标准库服务保留，未来在阿里云可用于托管构建产物及扩展后端功能。GitHub Pages 不运行 Go。
- 资料集中在 `data/profile.json`；不引入数据库、登录或后台管理。修改内容后需要重新构建；在 GitHub 上提交到 main 会自动构建和发布。
- 不依赖外部字体、图片或 CDN。使用白底、普通标题与项目列表，不使用装饰头像、卡片或时间线。

## 本地运行

静态版只需要 Node.js 24+。在项目根目录运行：

```sh
npm ci
npm run build
npm run preview
```

访问 http://127.0.0.1:4173 。这是纯静态预览，不需要启动 Go。

开发时运行 `npm run dev`，访问 http://127.0.0.1:5173 。

也可以在构建后用 Go 1.24+ 执行 `go run ./cmd/server`，访问 http://127.0.0.1:8080 。若 Go 缓存目录不可写，可设置 `GOCACHE="$PWD/.cache/go-build"`。

## 部署到 GitHub Pages

已提供 `.github/workflows/deploy-pages.yml`，每次推送 main 分支会自动安装依赖、构建并发布 `web/dist/`。工作流无需个人访问令牌。

以 GitHub 用户名 `Jackreceive` 为例：

1. 在 GitHub 新建公开仓库 `jackreceive.github.io`。为方便推送已有本地代码，创建空仓库，不勾选生成 README、许可证或 .gitignore。若该仓库已存在且有内容，先检查内容再合并，不要强制覆盖。
2. 在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
3. 从当前项目根目录推送代码。以下命令适用于尚未初始化 Git 的项目及新建的空仓库：

```sh
git init -b main
git add .
git commit -m "Create personal homepage"
git remote add origin https://github.com/Jackreceive/jackreceive.github.io.git
git push -u origin main
```

4. 在 **Actions** 页面等待 `Deploy personal homepage to GitHub Pages` 成功，然后从 **Settings → Pages → Visit site** 打开网站。预期地址为 `https://jackreceive.github.io/`；这是部署完成后的地址，并非当前已发布的结果。

若首次推送时还未启用 Pages，先完成第 2 步，再到 Actions 中选择该工作流并点击 **Run workflow**。

也可使用其他仓库名，例如 `personal-website`，发布地址将是 `https://jackreceive.github.io/personal-website/`。项目使用相对静态资源路径和 hash 页面路由，两种地址都能使用，不需要改代码。

之后修改 `data/profile.json` 或添加照片后提交并推送即可自动更新。照片和旅行内容作为文件上传到仓库；GitHub Pages 不提供网站内上传、登录管理或数据库服务。

当前仅准备了本地代码和自动部署配置，没有创建 GitHub 仓库或执行线上发布。

参考：[GitHub Pages 创建站点](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)、[Vite 静态部署](https://vite.dev/guide/static-deploy.html)。

## 更新个人信息

编辑 `data/profile.json`。邮箱、GitHub 链接与更新日期为公共字段，中文内容在 `locales.zh` 下，英文内容在 `locales.en` 下。修改经历或项目时同步更新两个语言版本，保持条目的 `id` 一致。页面按钮与提示的译文在 `web/src/main.jsx` 中。

页面默认标题和搜索摘要在 `web/index.html` 中，切换语言和页面时会同步更新标题、摘要与 HTML 的 `lang` 属性。

首页采用左侧个人照片、右侧姓名和联系方式的布局。将个人照片放入 `web/public/photos/portrait.jpg`，把 `data/profile.json` 的公共字段 `photo` 设置为 `/photos/portrait.jpg`，再运行 `npm run build`。中英文共用同一张照片，按原始比例显示；`photo` 为空时仅显示待添加提示。

## 添加旅行记录

当前提供旅行图文的展示页面与数据结构，尚无在线上传后台。之后可以直接添加本地文件，或另行接入带身份验证的上传管理功能。

1. 将照片放入 `web/public/photos/`，例如 `trip-01.jpg`。
2. 在 `locales.zh.lifeEntries` 添加记录，并在 `locales.en.lifeEntries` 添加同一 `id` 的英文版本。以下为结构示例，并未展示在网站上：

```json
{
  "id": "my-trip",
  "title": "旅行标题",
  "date": "2026-10-21",
  "location": "旅行目的地",
  "paragraphs": ["第一段旅行记录。", "第二段旅行记录。"],
  "photos": [
    {
      "src": "/photos/trip-01.jpg",
      "alt": "照片内容描述",
      "caption": "照片说明"
    }
  ]
}
```

3. 修改 JSON 或新增照片后运行 `npm run build`。GitHub Pages 用户提交并推送即可自动更新；Docker 部署则重新构建容器。

## 验证

```sh
npm run build
go test ./...
go vet ./...
```

Go 测试覆盖主页、资料与健康接口、无效资料错误、缺失资源、目录访问及资源缓存头。

## 将来部署到阿里云

这是独立项目，不依赖特定托管平台。下面提供两种方式；本次 Demo 未连接或修改云服务器。

### Docker Compose

将项目复制到装有 Docker Compose 的 Linux 服务器：

```sh
docker compose up -d --build
curl http://127.0.0.1:8080/api/health
```

Compose 默认仅绑定服务器本机 8080 端口。将 `deploy/nginx.conf.example` 中域名替换为真实域名，配置 Nginx 反向代理。正式上线时为域名配置 HTTPS，并按实际部署环境设置访问规则。

`data/` 以只读方式挂载到容器，供保留的 Go API 使用。静态前端读取构建时生成的资料文件，因此修改 JSON、照片或前端代码后都需要运行 `docker compose up -d --build`。

### 直接运行二进制

在构建机器执行：

```sh
npm ci
npm run build
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -o bin/website ./cmd/server
```

如果服务器为 ARM64，将 `GOARCH` 改成 `arm64`。上传 `bin/website`、`web/dist/`、`data/`，保留相对目录结构，从部署根目录运行 `./bin/website`。建议使用 systemd 管理进程，并通过 Nginx 提供域名访问。

可配置环境变量：`ADDR`（默认 `127.0.0.1:8080`）、`PROFILE_PATH`（默认 `data/profile.json`）、`WEB_DIR`（默认 `web/dist`）。上线前按真实域名和服务器条件补充运维配置。
