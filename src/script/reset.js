const fs = require("fs");
fs.writeFileSync(__dirname+'/../user_custom/py.json',fs.readFileSync(__dirname+'/../defaults/py.json', 'utf8'),()=>{});
// const import = JSON.parse(fs.readFileSync(__dirname+'/../user_custom/shortcut.jsonc', 'utf8'));