# srayons.github.io — HTML 压缩 / 加壳 构建工具

把可读的源文件 `src/index.html` **自动压缩**（可选再套一层**加密壳**），
生成真正对外发布的 `dist/index.html`，然后自动部署到 GitHub Pages。

---

## 一、先搞清楚两件事

| | 压缩（Minify） | 加密（加壳 / 混淆） |
|---|---|---|
| **做了什么** | 删空格换行、注释、冗余属性，压缩内联 CSS/JS | 把整页源码编码封装，页面加载时再用脚本还原 |
| **效果** | 体积减小 **20%～30%**，加载更快 | 「查看源代码」里看不到原文结构，提高抄袭门槛 |
| **是否无损** | ✅ 完全无损，功能、样式、SEO 全不受影响 | ⚠️ 有代价：首屏多一次解码、SEO 不友好 |
| **能否真正保密** | 不涉及 | ❌ **不能**。浏览器最终必须还原并执行，懂技术的人依旧能还原 |

> **关键认知**：GitHub Pages 是纯静态托管，没有后端。
> 所以任何「HTML 加密」本质上都只是**混淆 / 加壳**，只能防住 90% 的顺手复制，
> **不能**用来保护真正的机密信息（密钥、后台地址等请务必放到服务端）。

**推荐做法：压缩必开，加壳按需开。**

---

## 二、仓库结构

```
srayons.github.io/
├── src/
│   └── index.html              ← 你日常维护的源文件（可读、带注释）
├── tools/
│   ├── build.mjs               ← 构建脚本（压缩 / 加壳）
│   ├── package.json
│   └── package-lock.json
├── .github/workflows/deploy.yml ← push 后自动构建 + 部署
├── dist/                       ← 构建产物（可 gitignore，由 CI 生成）
│   └── index.html
├── .nojekyll                   ← 告诉 Pages 别用 Jekyll 处理文件
└── README.md
```

> 日常你只改 `src/index.html`，**不要**手动去改 `dist/index.html`，它每次都会被覆盖。

---

## 三、本地怎么用

```bash
# 1. 装依赖（只需一次）
cd tools
npm install

# 2. 回到仓库根目录，执行压缩
cd ..
node tools/build.mjs

#    输出示例：
#    原始体积 : 111.4 KB
#    压缩后   : 82.9 KB   压缩率 25.6%

# 3. 想要「加密壳」版本
node tools/build.mjs --shell

# 4. 本地预览一下产物
cd dist && python3 -m http.server 8080
#    浏览器打开 http://localhost:8080
```

自定义输入输出：

```bash
node tools/build.mjs --in src/about.html --out dist/about.html
```

---

## 四、怎么部署到 GitHub Pages（两种方式，二选一）

### 方式 A：自动部署（推荐）

1. 把本目录结构整体放进 `srayons/srayons.github.io` 仓库，`git push` 到 `main`。
2. 打开仓库 **Settings → Pages**，把 **Source 改为 `GitHub Actions`**（不是 Deploy from a branch）。
3. 以后再 `push`，`.github/workflows/deploy.yml` 会自动：装依赖 → 压缩 → 部署。
4. 约 30 秒后访问 `https://srayons.github.io` 即可看到压缩后的页面。

> ⚠️ 常见坑：Actions 跑成功但页面 404，99% 是 **Pages 的 Source 没选对**。
> 用本工作流必须选 `GitHub Actions`。

### 方式 B：手动部署（不想要 CI）

```bash
node tools/build.mjs                       # 产出 dist/index.html
cp dist/index.html ./index.html            # 覆盖仓库根目录的 index.html
git add index.html && git commit -m "压缩页面" && git push
```

因为 `srayons.github.io` 是**用户主页仓库**，Pages 默认读取 `main` 分支根目录的 `index.html`。

---

## 五、压缩配置说明（tools/build.mjs）

已针对「单页宣传站」调成**保守安全档**，只做确定无损的操作：

```js
{
  collapseWhitespace: true,          // 合并空白（<pre> 自动跳过）
  removeComments: true,              // 删除 HTML 注释
  minifyCSS: true,                   // 压缩内联 <style>
  minifyJS: true,                    // 压缩内联 <script>
  removeAttributeQuotes: false,      // 关闭：去引号易踩坑
  removeEmptyAttributes: false,      // 关闭：JS 可能依赖 class=""
  removeOptionalTags: false,         // 关闭：保留闭合标签兼容性最好
}
```

**务必注意**：

- 页面里若出现 `<pre>` / `<textarea>`（代码展示区），压缩会自动跳过其内部空白，不会破坏格式。
- 页面若用了 Vue/React 模板插值 `{{ }}` 或 `<% %>`，脚本里的 `ignoreCustomFragments` 已做保护。
- **压缩后一定要在浏览器里点一遍**：锚点跳转、FAQ 折叠、按钮交互都要试，确认 JS 没被打断。

---

## 六、加壳（--shell）的代价，想清楚再开

| 项目 | 影响 |
|---|---|
| 首屏渲染 | 多一次 Base64 解码 + `document.write`，慢约 10～50ms |
| SEO | 搜索引擎抓不到正文（对宣传页是硬伤） |
| 分享卡片 | 微信/QQ 抓取标题、摘要可能失效 |
| 文件体积 | Base64 会膨胀约 33%（111 KB → 111 KB，先压缩再编码可抵消） |
| 防抄袭 | 只挡住 90% 的普通用户，开发者仍可还原 |

**结论**：宣传下载页要**被搜到、被分享**，建议**只压缩、不加壳**。
加壳更适合内部工具页、演示页、不想被直接搬运的页面。

---

## 七、要不要更强的混淆？

如果核心是 JS 逻辑，可以再加一层专业 JS 混淆：

```bash
npm i -D javascript-obfuscator
npx javascript-obfuscator src/app.js --output dist/app.js
```

但**纯 HTML/CSS 的视觉效果无法真正隐藏**——别人照着截图也能复刻。
把精力放在内容与产品本身，比对抗抄袭更划算。
