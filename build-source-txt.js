const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\王文哲\\Desktop\\轻学';
const src = path.join(dir, 'study-app');
const outPath = 'C:\\Users\\王文哲\\Desktop\\轻学源代码.txt';

const html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(src, 'css', 'style.css'), 'utf8');
const dataJs = fs.readFileSync(path.join(src, 'js', 'data.js'), 'utf8');
const appJs = fs.readFileSync(path.join(src, 'js', 'app.js'), 'utf8');

const sep = (name) => '\n' + '='.repeat(80) + '\n  \u6587\u4EF6: ' + name + '\n' + '='.repeat(80) + '\n\n';

let txt = '='.repeat(80) + '\n \u8F7B\u5B66 (QingXue) - \u8F7B\u91CF\u7EA7\u5B66\u4E60\u5DE5\u5177 \u6E90\u4EE3\u7801\n \u4ED3\u5E93\u5730\u5740: https://github.com/wangwz200/didactic-giggle\n \u5728\u7EBF\u8BBF\u95EE: https://wangwz200.github.io/didactic-giggle/\n' + '='.repeat(80) + '\n';

txt += sep('index.html') + html;
txt += sep('css/style.css') + css;
txt += sep('js/data.js') + dataJs;
txt += sep('js/app.js') + appJs;

fs.writeFileSync(outPath, txt, 'utf8');
console.log('Written: ' + outPath + ' (' + txt.length + ' bytes)');
