const platform = process.platform
async function  get_env(key="path"){
    console.log(platform)
    const util = require('util');
    const childProcess = require('child_process');
    const exec = util.promisify(childProcess.exec);
    console.log(key);
    try{
        const out = await exec(`reg query "HKEY_CURRENT_USER\\Environment" /v ${key}`)
        return out.stdout.split("    ")[3].trim()
    }catch{
        return null;
        
        
    }
}
function add_env(key="path", value="C:\\hogehoge"){
    const childProcess = require('child_process');
    // const process = (key)=>{
    //     return new Promise((resolve, reject)=>{get_env(resolve, reject, key)})
    // }
    get_env(key).then((path)=>{
        if(`${path};`.indexOf(`${value};`) === -1){
            console.log(path);
            const addedenv = path !== null ? `${path};${value}`:value ;
            console.log(addedenv)
            childProcess.exec(`reg add "HKEY_CURRENT_USER\\Environment" /f /v ${key} /d "${addedenv}"`,()=>{})
        }
    })
    // // const path = get_env(key);
    // if(path === undefined){
    //     function loop(){
    //         console.log(path)
    //         setTimeout(loop, 5);
    //     }
    //     return false;
    // }
    // const addedenv = `${path};${value}`;
    // console.log(`reg add "HKEY_CURRENT_USER\\Environment" /v ${key} /d ${addedenv}`)
    
}
module.exports = {
  "get_env": get_env,
  "add_env": add_env
};
// add_env(process.argv[2], process.argv[3]);
// console.log(process.argv)