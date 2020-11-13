const fs = require("fs");

let files = [];
function traverse(folder) {
    for (let i of fs.readdirSync(folder, {withFileTypes: true})) {
        let filePath = folder + "/" + i.name;
        if (i.isFile())
            files.push(filePath);
        else
            traverse(filePath);            
    }
}

traverse("JSON");
console.log(JSON.stringify(files, null, 4));