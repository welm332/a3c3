const fs = require("fs");
for(const fileName of fs.readdirSync(__dirname+'/../defaults')){
    fs.writeFileSync(__dirname+`/../user_custom/${fileName}`,fs.readFileSync(__dirname+`/../defaults/${fileName}`, 'utf8'),()=>{});    
}

// const import = JSON.parse(fs.readFileSync(__dirname+'/../user_custom/shortcut.jsonc', 'utf8'));