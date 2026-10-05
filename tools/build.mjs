#!/usr/bin/env node
/**
 * build.mjs — GitHub Pages 单页「压缩 + 加壳」构建脚本
 *
 * 用法（在仓库根目录执行）：
 *   npm i                                # 首次安装依赖
 *   node tools/build.mjs                 # 压缩 src/index.html -> dist/index.html
 *   node tools/build.mjs --shell         # 压缩后再加壳，输出 dist/index.html
 *   node tools/build.mjs --in a.html --out dist/index.html
 *
 * 说明：
 *   1) 压缩(HTML minify) 是真正减小体积、加快加载的手段，无损、安全。
 *   2) 加壳(加密) 只是把源码藏起来、提高抄袭门槛，浏览器最终仍要还原执行，
 *      因此不是"绝对安全"，请勿用于保护真正的机密信息。
 */

import { minify } from 'html-minifier-terser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---------------- 参数解析 ---------------- */
const argv = process.argv.slice(2);
const getArg = (name, def) => {
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : def;
};
const hasFlag = (name) => argv.includes(name);

const IN_FILE = path.resolve(getArg('--in', path.join(__dirname, '..', 'src', 'index.html')));
const OUT_FILE = path.resolve(getArg('--out', path.join(__dirname, '..', 'dist', 'index.html')));
const USE_SHELL = hasFlag('--shell');

/* ---------------- 压缩配置 ----------------
 * 保守优先：只做确定安全的操作，避免压缩后页面白屏。
 * - collapseWhitespace  合并空白（<pre> 会被自动跳过）
 * - removeComments      删除 HTML 注释
 * - minifyCSS/minifyJS  压缩内联 <style> / <script>
 * - removeAttributeQuotes 关闭：部分含特殊字符的属性去掉引号会解析异常
 * - removeEmptyAttributes 关闭：JS 可能依赖 class="" 之类的空属性
 */
const MINIFY_OPTIONS = {
  collapseWhitespace: true,
  conservativeCollapse: false,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  collapseBooleanAttributes: true,
  keepClosingSlash: true,
  minifyCSS: true,
  minifyJS: { compress: true, mangle: true },
  removeAttributeQuotes: false,
  removeEmptyAttributes: false,
  removeOptionalTags: false, // 保留闭合标签，兼容性最好
  ignoreCustomFragments: [/<%[\s\S]*?%>/, /\{\{[\s\S]*?\}\}/],
};

/* ---------------- 加壳（加密） ---------------- */
function wrapShell(html, title) {
  const b64 = Buffer.from(html, 'utf8').toString('base64');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body>
<noscript>本页面需要启用 JavaScript 才能正常显示。</noscript>
<script>
(function(){
  var d="__DATA__";
  var bin=atob(d), len=bin.length, bytes=new Uint8Array(len);
  for(var i=0;i<len;i++){bytes[i]=bin.charCodeAt(i);}
  var html=new TextDecoder("utf-8").decode(bytes);
  document.open();document.write(html);document.close();
})();
</script>
</body>
</html>`.replace('__DATA__', b64);
}

/* ---------------- 主流程 ---------------- */
function fmt(bytes) {
  return bytes >= 1024 ? (bytes / 1024).toFixed(1) + ' KB' : bytes + ' B';
}

function main() {
  if (!fs.existsSync(IN_FILE)) {
    console.error('找不到输入文件：' + IN_FILE);
    process.exit(1);
  }

  const src = fs.readFileSync(IN_FILE, 'utf8');
  const srcSize = Buffer.byteLength(src, 'utf8');

  return minify(src, MINIFY_OPTIONS).then((result) => {
    const minSize = Buffer.byteLength(result, 'utf8');

    let finalOut = result;
    let label = '压缩版';

    if (USE_SHELL) {
      const titleMatch = src.match(/<title>([\s\S]*?)<\/title>/i);
      finalOut = wrapShell(result, titleMatch ? titleMatch[1].trim() : 'RecOns');
      label = '压缩+加壳版';
    }

    const outSize = Buffer.byteLength(finalOut, 'utf8');

    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, finalOut, 'utf8');

    console.log('源文件   : ' + IN_FILE);
    console.log('输出     : ' + OUT_FILE + '  (' + label + ')');
    console.log('-------------------------------------------');
    console.log('原始体积 : ' + fmt(srcSize));
    console.log('压缩后   : ' + fmt(minSize) + '   压缩率 ' + (100 - (minSize / srcSize) * 100).toFixed(1) + '%');
    if (USE_SHELL) {
      console.log('加壳后   : ' + fmt(outSize) + '  （Base64 会膨胀约 33%，属正常）');
    }
    console.log('-------------------------------------------');
    console.log('完成，可直接把 ' + path.relative(process.cwd(), OUT_FILE) + ' 推送到 GitHub Pages。');
  });
}

main().catch((err) => {
  console.error('构建失败：');
  console.error(err);
  process.exit(1);
});
