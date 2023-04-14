"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
exports.getConfig = function () {
    var rawData;
    try {
        rawData = fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'mandarina.json'), 'utf8');
    }
    catch (e) {
        throw Error('Error: Be sure you are running your server from the root (where mandarina.json file is located');
    }
    var config = JSON.parse(rawData);
    if (!config.dir) {
        throw Error('Error: please set "dir" in  madarina.json file');
    }
    if (!config.dir.schemas || !Array.isArray(config.dir.schemas) || config.dir.schemas.length === 0) {
        throw Error('Error: please set "dir.schemas" in  madarina.json file. Make sure it is a array');
    }
    if (config.dir.actions && !Array.isArray(config.dir.actions)) {
        throw Error('Error: please make sure "dir.actions" is a array');
    }
    if (config.dir.tables && !Array.isArray(config.dir.tables)) {
        throw Error('Error: please make sure "dir.tables" is a array');
    }
    if (!config.dir.prisma) {
        throw Error('Error: please set "dir.prisma" in  madarina.json file');
    }
    if (!config.dir.generated) {
        throw Error('Error: please set "dir.generated" in  madarina.json file');
    }
    return (config);
};
var walkSync = function (dir, fileList) {
    var files = fs_1.default.readdirSync(dir);
    fileList = fileList || [];
    files.forEach(function (file) {
        var pathFile = path_1.default.join(dir, file);
        if (fs_1.default.statSync(pathFile).isDirectory()) {
            fileList = walkSync(pathFile, fileList);
        }
        else {
            if (path_1.default.extname(file) === '.js')
                fileList.push(pathFile);
        }
    });
    return fileList;
};
exports.loadSchemas = function (dir) {
    var tables = [];
    var schemas = [];
    var actions = [];
    dir.schemas.forEach(function (dir) {
        schemas = walkSync(path_1.default.join(process.cwd(), dir), schemas);
    });
    if (dir.actions) {
        dir.actions.forEach(function (dir) {
            actions = walkSync(path_1.default.join(process.cwd(), dir), actions);
        });
    }
    if (dir.tables) {
        dir.tables.forEach(function (dir) {
            tables = walkSync(path_1.default.join(process.cwd(), dir), tables);
        });
    }
    schemas.forEach(function (schema) {
        var content = fs_1.default.readFileSync(schema, 'utf8');
        if (true || content.match(/new *Schema/)) {
            console.info('loading schema: ', schema);
            require(schema);
        }
    });
    tables.forEach(function (table) {
        var content = fs_1.default.readFileSync(table, 'utf8');
        if (true || content.match(/new *Table/)) {
            console.info('loading table: ', table);
            require(table);
        }
    });
    actions.forEach(function (action) {
        var content = fs_1.default.readFileSync(action, 'utf8');
        if (true || content.match(/new *Table/)) {
            console.info('loading action: ', action);
            require(action);
        }
    });
};
//# sourceMappingURL=utils.js.map