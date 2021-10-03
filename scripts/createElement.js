function parseElement(emstr){
    if(emstr[0] !== "<" || emstr[emstr.length-1] !== ">"){
        return false
    }
    emstr = emstr.substr(1)
    // while(emstr.indexOf(" =") !== -1 || emstr.indexOf("= ") !== -1 )
    emstr  = emstr.replaceAll(" =","=").replaceAll("= ","=");
    settigs = emstr.split(" ");
    const em = document.createElement(settig[0]);
    for(let i=1,len=settigs.length;i<len;i+=2){
        em.setAttribute(settings[i],settings[i+1]);
    }
    console.log(em);
}
parseElement(process.argv[2]);