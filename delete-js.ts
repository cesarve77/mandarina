
const path = require('path');
const fs = require('fs');
const walkSync = function (dir: string) {
    const files = fs.readdirSync(dir);
    files.forEach(function (file) {
        const pathFile = path.join(dir, file)
        if (fs.statSync(pathFile).isDirectory()) {
            if (!pathFile.match(/node_modules/)){
                walkSync(pathFile);
            }
        } else {
            if (path.basename(pathFile).match(/.*\.ts(x?)$/)) {
                const js=pathFile.replace(/(.*)\.ts(x?)$/,`$1.jsx`)
                const map=pathFile.replace(/(.*)\.ts(x?)?$/,`$1.js.map`)
                if (fs.existsSync(js)){
                    fs.unlinkSync(js)
                }
                if (fs.existsSync(map)){
                    fs.unlinkSync(map)
                }
            }
        }
    });
};
walkSync(process.cwd())