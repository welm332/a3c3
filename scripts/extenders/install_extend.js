window.addEventListener('DOMContentLoaded', ()=>{
    palette_commands["install Extensions"] = "open_install_page()";
});
if(palette_commands !== null){
    palette_commands["install Extensions"] = "open_install_page()";
}
// function extentions_bt(operation){
    
// }

function open_install_page(){
    tab=create_tab();
    loadhtml(document.querySelector(".editor[data-fullpath='"+tab.dataset.fullpath+"']"), window.requires.dirname+"/../scripts/extenders/inst_page.html");
    tab.querySelector("#tab_name").textContent = "install_page";
    const extensions = JSON.parse(window.requires.iconv.decode(window.requires.exe.execSync("curl https://raw.githubusercontent.com/welm332/extends/main/install.json"), "utf-8"));
    parent = document.querySelector("#installers");
    for(em of extensions["install"]){
        const extension = document.createElement("div");
        const name = document.createElement("div");
        const descriptions = document.createElement("div");
        const buttons = document.createElement("div");
        name.textContent = em["name"];
        descriptions.textContent = em["description"];
        
        const deleteBt = document.createElement("button");
        deleteBt.textContent = "削除";
        deleteBt.className = "exsits";
        deleteBt.onclick = (event)=>{
            // const parent = event.target.parentElement;
            // console.log(parent.children)
            window.requires.extensions.extensions("uninstall",event.target.parentElement.parentElement.firstChild.textContent)
            buttons.querySelector(".noExsits").style.display = "";
             for(const em of buttons.querySelectorAll(".exsits")){
                    em.style.display = "none";
                }
            }
            // parent.appendChild(installBt);
        const invalidBt = document.createElement("button");
        invalidBt.textContent = "無効にする";
        invalidBt.className = "exsits";
        buttons.appendChild(deleteBt);
        buttons.appendChild(invalidBt);
        const installBt = document.createElement("button");
        installBt.textContent = "インストールする";
        installBt.className = "noExsits";
        installBt.onclick = (event)=>{
            window.requires.extensions.extensions("install",event.target.parentElement.parentElement.firstChild.textContent)
            buttons.querySelector(".noExsits").style.display = "none";
                for(const em of buttons.querySelectorAll(".exsits")){
                    em.style.display = "";
                }
            // console.log(event.target.parentElement.parentElement.firstChild)
            
        }
        buttons.appendChild(installBt);
        extension.appendChild(name);
        extension.appendChild(descriptions);
        extension.appendChild(buttons);
        parent.appendChild(extension);
        // 拡張機能をすでに取り込んでるなら
        if(fs.readdirSync(user_custom_path+"/../extends/").indexOf(em["name"]) !== -1){
                buttons.querySelector(".noExsits").style.display = "none";
            }else{
                for(const em of buttons.querySelectorAll(".exsits")){
                    em.style.display = "none";
                }
        }
        
        
    }
}