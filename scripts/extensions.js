
function extentions(operation="help"){
    const baseurl = "https://raw.githubusercontent.com/welm332/extends/main/";
    const fs = require("fs");
    iconv = require("iconv-lite");
    cp = require("child_process")
    extention_dict = JSON.parse(iconv.decode(cp.execSync(`curl -s ${baseurl}install.json`), "utf-8"));
    switch(operation){
        case "help":{
            console.log(`
            yarn run extensions [operation]
            operantion:
                help: infomation for command
                list: output extention list
                list -lo: output extention list local
                info [extention name]: print  extention information
                install [extention name]: install extention
                uninstall [extention name]: uninstall extention
                `);
                break;
        }
        case "list":{
            if(process.argv[3] === "-lo"){
                console.log('\u001b[32m'+"repo:"+require("path").join(__dirname+"/../extends/")+'\u001b[0m')
                console.log("\n\t"+fs.readdirSync(__dirname+"/../extends/").filter((em)=>fs.statSync(__dirname+"/../extends/"+em).isDirectory()).join("\n\t"));
                break;
            }
            console.log('\u001b[32m'+"repo:https://raw.githubusercontent.com/welm332/extends/main/"+'\u001b[0m')
            console.log((extention_dict["install"]).map((em)=>"\n\t"+em["name"]).join(""));
            break;
        }
        case "install":{
            const target = extention_dict["install"].filter((em)=>em["name"] === process.argv[3])
            extends_path = __dirname+"/../extends/";
            if (target.length === 1){
                console.log(extends_path+target[0]["name"]);
                console.log(fs.existsSync(extends_path+target[0]["name"]))
                if(fs.existsSync(extends_path+target[0]["name"])){
                    console.log("allready  exists this extention");
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
            if(fs.existsSync(extends_path+process.argv[3])){
                require("fs-extra").removeSync(extends_path+process.argv[3]);
                }
            else{
                console.log("not exists this extention");
                
            }
            break;
        }
        case "info":{
            const target = extention_dict["install"].filter((em)=>em["name"] === process.argv[3])
            console.log("===name===\n\t"+target[0]["name"]);
            console.log("===description===\n\t"+target[0]["description"]);
            break;
            
        }
    }
    
}
extentions(process.argv[2])