document.getElementById("select-path").onclick =()=>{
    window.api.selectDir().then((path)=>{
        console.log(path);
        const inputer = document.getElementById("pathInputer");
        inputer.value = path;
        inputer.size = inputer.value.length;
    })
}
document.getElementById("install").onclick = ()=>{
    const path = document.getElementById("pathInputer").value;
    const pathaddflag=document.getElementById("add-path").checked;
    document.getElementById("status").textContent = "インストール中";
    window.api.install(path, pathaddflag)
}
document.getElementById("pathInputer").oninput = (event)=>{
    console.log(event.target)
    console.log(event.target.value)
    event.target.size = event.target.value.length;
}
window.api.on("install Done",()=>{
    document.getElementById("status").textContent = "インストール完了";
})
    
