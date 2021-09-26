async function  get_env(key="path"){
    const util = require('util');
    const childProcess = require('child_process');
    const exec = util.promisify(childProcess.exec);
    console.log(key)
    i = await exec(`reg query "HKEY_CURRENT_USER\\Environment" /v ${key}`
    )
    return i.stdout.split("    ")[3].trim()
}
function add_env(key="path", value="C:\\hogehoge"){
    const childProcess = require('child_process');
    // const process = (key)=>{
    //     return new Promise((resolve, reject)=>{get_env(resolve, reject, key)})
    // }
    get_env(key).then((path)=>{
        const addedenv = `${path};${value}`;
        console.log(addedenv)
        childProcess.exec(`reg add "HKEY_CURRENT_USER\\Environment" /f /v ${key} /d "${addedenv}"`,()=>{})
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
add_env(process.argv[2], process.argv[3]);
// console.log(process.argv)