const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\王文哲\\Desktop\\轻学';
const src = path.join(dir, 'study-app');

let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(src, 'css', 'style.css'), 'utf8');
const dataJs = fs.readFileSync(path.join(src, 'js', 'data.js'), 'utf8');
const appJs = fs.readFileSync(path.join(src, 'js', 'app.js'), 'utf8');

html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>' + css + '</style>');
html = html.replace('<script src="js/data.js"></script>', '<script>' + dataJs + '</script>');
html = html.replace('<script src="js/app.js"></script>', '<script>' + appJs + '</script>');
html = html.replace('<link rel="manifest" href="manifest.json">\n', '');
html = html.replace(
  '<script>\nif (\'serviceWorker\' in navigator) {\n  navigator.serviceWorker.register(\'sw.js\').catch(function(){});\n}\n</script>',
  ''
);

const outPath = path.join(dir, '轻学_便携版.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log('Written successfully. Size: ' + html.length + ' bytes');
