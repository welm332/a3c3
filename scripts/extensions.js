
function extensions(...arg){
    operation = arg[0];
    options = arg.slice(1);
    const baseurl = "https://raw.githubusercontent.com/welm332/extends/main/";
    const fs = require("fs");
    iconv = require("iconv-lite");
    cp = require("child_process")
    extension_dict = JSON.parse(iconv.decode(cp.execSync(`curl -s ${baseurl}install.json`), "utf-8"));
    switch(operation){
        case "help":{
            console.log(`
            yarn run extensions [operation]
            operantion:
                help: infomation for command
                list: output extension list
                list -lo: output extension list local
                info [extension name]: print  extension information
                install [extension name]: install extension
                uninstall [extension name]: uninstall extension
                `);
                break;
        }
        case "list":{
            result ='\u001b[32m'+"repo:https://raw.githubusercontent.com/welm332/extends/main/"+'\u001b[0m' + (extension_dict["install"]).map((em)=>"\n\t"+em["name"]).join("");
            if(options[0] === "-lo"){
                // console.log('\u001b[32m'+"repo:"+require("path").join(__dirname+"/../extends/")+'\u001b[0m')
                result = '\u001b[32m'+"repo:"+require("path").join(__dirname+"/../extends/")+'\u001b[0m'+"\n\t"+fs.readdirSync(__dirname+"/../extends/").filter((em)=>fs.statSync(__dirname+"/../extends/"+em).isDirectory()).join("\n\t")
            }
            console.log(result);
            return result;
            // break;
        }
        case "install":{
            const target = extension_dict["install"].filter((em)=>em["name"] === options[0])
            extends_path = __dirname+"/../extends/";
            if (target.length === 1){
                console.log(extends_path+target[0]["name"]);
                console.log(fs.existsSync(extends_path+target[0]["name"]))
                if(fs.existsSync(extends_path+target[0]["name"])){
                    console.log("allready  exists this extension");
                    break;
                }
                install_list = ["point.json"].concat(JSON.parse(iconv.decode(cp.execSync("curl -s "+baseurl+target[0]["name"]+"/point.json"), "utf-8"))["download"]);
                fs.mkdirSync(extends_path+target[0]["name"]);
                for(em of install_list){
                    console.log("curl -s "+baseurl+target[0]["name"]+"/"+em+" --output "+extends_path+target[0]["name"]+em);
                    cp.execSync("curl -s "+baseurl+target[0]["name"]+"/"+em+" --output "+extends_path+target[0]["name"]+"/"+em)
                    
                }
                
                
            }
            break;
        }
        case "uninstall":{
            extends_path = __dirname+"/../extends/";
            if(fs.existsSync(extends_path+options[0])){
                require("fs-extra").removeSync(extends_path+options[0]);
                }
            else{
                console.log("not exists this extension");
                
            }
            break;
        }
        case "info":{
            const target = extension_dict["install"].filter((em)=>em["name"] === options[0])
            console.log("===name===\n\t"+target[0]["name"]);
            console.log("===description===\n\t"+target[0]["description"]);
            break;
            
        }
    }
    
}
// 実行元の特定
if (typeof module !== 'undefined' && !module.parent) {
    extensions(...process.argv.slice(2));
} else {
    exports["extensions"] = extensions;
}
