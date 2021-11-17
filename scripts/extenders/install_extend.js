window.addEventListener('DOMContentLoaded', ()=>{
    palette_commands["intall Extensions"] = "openintall_page";//`tab=create_tab();loadhtml(document.querySelector(".editor[data-fullpath='"+tab.dataset.fullpath+"']"), "/../extends/webviewer/web.html");tab.querySelector("#tab_name").textContent = "Browser"`;
});
if(palette_commands !== null){
    palette_commands["intall Extensions"] = "openintall_page";//`tab=create_tab();loadhtml(document.querySelector(".editor[data-fullpath='"+tab.dataset.fullpath+"']"), "/../extends/webviewer/web.html");tab.querySelector("#tab_name").textContent = "Browser"`;
}
function open_install_page(){
    tab=create_tab();
    loadhtml(document.querySelector(".editor[data-fullpath='"+tab.dataset.fullpath+"']"), "/../extends/extenders/inst_page.html");
    tab.querySelector("#tab_name").textContent = "intall_page";
    const extentions = JSON.parse(window.requires.iconv.decode(window.requires.exe.execSync("curl https://raw.githubusercontent.com/welm332/extends/main/intall.json"), "utf-8"));
    parent = document.querySelector("#intallers");
    for(em of extentions["install"]){
        const name = document.createElement("div");
        const descriptions = document.createElement("div");
        name.textContent = em["name"];
        descriptions.textContent = em["description"];
        parent.appendChild(name);
        parent.appendChild(descriptions);
        
    }
}