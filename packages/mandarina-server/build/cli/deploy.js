"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var exec = require('child_process').execSync;
exports.deploy = function () {
    var config = utils_1.getConfig();
    if (!config)
        return;
    console.info('deploying');
    exec("cd prisma && PRISMA_MANAGEMENT_API_SECRET=" + config.secret + " prisma deploy");
    console.info('done!');
};
//# sourceMappingURL=deploy.js.map