"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = void 0;
var utils_1 = require("./utils");
var exec = require('child_process').execSync;
var deploy = function () {
    var config = (0, utils_1.getConfig)();
    if (!config)
        return;
    console.info('deploying');
    exec("cd prisma && PRISMA_MANAGEMENT_API_SECRET=".concat(config.secret, " prisma deploy"));
    console.info('done!');
};
exports.deploy = deploy;
//# sourceMappingURL=deploy.js.map