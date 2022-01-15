async function getloads(auto_reader=false){
    const dirname = window.requires.dirname;
    const extends_path = user_custom_path+"/../extends";
    const fs = window.requires.fs;
    let extenders = fs.readdirSync(extends_path);
    const deletes = [".git", ".gitignore", "remote","install.json"];
    const path = window.requires.path;
    // extename_dict = {"js":"script","css":"link"}
    extenders = extenders.filter((em)=>{return deletes.indexOf(em) === -1});
    // console.log(extend);
    load_elements = [];
    let points = [];
    for(const extend of extenders){
        const dir = fs.readdirSync(`${extends_path}/${extend}`);
        if(dir.indexOf("point.json") !== -1){
            const point = JSON.parse(fs.readFileSync(`${extends_path}/${extend}/point.json`, 'utf8'));
            if(!point["validity"]){
                continue;
            }
            point["extend_path"] = extend;
            points.push(point);
            // if(!point["validity"]){
            //     continue;
            // }
            // const load_list = point["load"];
            // for(import_dict of load_list){
            //     const em = document.createElement(import_dict["type"]);
            //     for(const key of Object.keys(import_dict["attr"])){
                    
            //         em.setAttribute(key, import_dict["attr"][key].replaceAll("%dirname%", `${extends_path}/${extend}`));
            //     }
            //     load_elements.push(em);
            // }
        }else if(auto_reader){
            for(const file of dir){
                const file_path = `${extends_path}/${extend}/${file}`
                const extname = path.extname(file_path);
                if(extname === ".js"){
                    const em = document.createElement("script");
                    em.src = file_path;
                    load_elements.push(em);
                }else if(extname === ".css"){
                    const em = document.createElement("link");
                    em.href = file_path;
                    load_elements.push(em);
            }
                
            }
        }
    }
        points = points.map((em)=>{
            em["loadOrder"] = Object.keys(em).indexOf("loadOrder") === -1 ? 0 : em["loadOrder"];
            return em;
        })
        points.sort((a, b) => a["loadOrder"] - b["loadOrder"] );
        console.log(points)
        for(const point of points){
            const load_list = point["load"];
            for(import_dict of load_list){
                const em = document.createElement(import_dict["type"]);
                for(const key of Object.keys(import_dict["attr"])){
                    
                    em.setAttribute(key, import_dict["attr"][key].replaceAll("%dirname%", `${extends_path}/${point["extend_path"]}`));
                }
                load_elements.push(em);
            }
        }
        // console.log(load_elements);
        for(const em of load_elements){
            console.log(em);
            document.head.appendChild(em);
        
    }
}
//   <link href="main.css" rel="stylesheet"/>
//   <div id="OpenFiles" type="hidden"></div>
//   <script src="editor.js"></script>
//   <script src="c:/users/taiki/desktop/program/portfolio/150819_electron_text_editor/extends/extenders/load_extends.js"></script>
  

getloads(false);