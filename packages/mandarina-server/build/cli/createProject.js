"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exec = require('child_process').execSync;
exports.createProject = function (name) {
    console.info("creating project " + name);
    exec("git clone git@github.com:cesarve77/mandarina-boilerplate.git " + name);
    exec("cd " + name + " && npm i");
    console.info("done!");
};
//# sourceMappingURL=createProject.js.map