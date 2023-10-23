"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = void 0;
var exec = require('child_process').execSync;
var createProject = function (name) {
    console.info("creating project ".concat(name));
    exec("git clone git@github.com:cesarve77/mandarina-boilerplate.git ".concat(name));
    exec("cd ".concat(name, " && npm i"));
    console.info("done!");
};
exports.createProject = createProject;
//# sourceMappingURL=createProject.js.map