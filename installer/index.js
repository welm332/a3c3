document.getElementById("select-path").onclick =()=>{
    window.api.selectDir().then((path)=>{
        console.log(path)
        document.getElementById("pathInputer").value = path
    })
}
document.getElementById("install").onclick = ()=>{
    const path = document.getElementById("pathInputer").value;
    const pathaddflag=document.getElementById("add-path").checked;
    window.api.install(path, pathaddflag)
}
    
