"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genFile = void 0;
var utils_1 = require("../utils");
var mandarina_1 = require("mandarina");
var genFilesUtils_1 = require("./genFilesUtils");
var CustomAction_1 = require("../../Action/CustomAction");
var __1 = require("../..");
var genFile = function () {
    var config = (0, utils_1.getConfig)();
    (0, utils_1.loadSchemas)(config.dir);
    (0, genFilesUtils_1.createDir)(config.dir.prisma);
    (0, genFilesUtils_1.resetDir)(config.dir.prisma);
    var models = new Set();
    var processedSubSchemas = [];
    for (var schemaName in __1.Table.instances) {
        var schema = mandarina_1.Schema.getInstance(schemaName);
        var fileName = schema.name.toLowerCase();
        var graphql = (0, genFilesUtils_1.getGraphQLModel)(schema);
        (0, genFilesUtils_1.saveFile)(config.dir.prisma, fileName, graphql, 'model');
        models.add("datamodel/".concat(fileName, ".model.graphql"));
        var subSchemas = (0, genFilesUtils_1.getSubSchemas)(schema);
        for (var _i = 0, subSchemas_1 = subSchemas; _i < subSchemas_1.length; _i++) {
            var subsSchema = subSchemas_1[_i];
            if (processedSubSchemas.includes(subsSchema)) {
                continue;
            }
            processedSubSchemas.push(schemaName);
            var schema_1 = mandarina_1.Schema.getInstance(subsSchema);
            var graphql_1 = (0, genFilesUtils_1.getGraphQLModel)(schema_1);
            var fileName_1 = getFileName(schema_1);
            models.add("datamodel/".concat(fileName_1, ".model.graphql"));
            (0, genFilesUtils_1.saveFile)(config.dir.prisma, fileName_1, graphql_1, 'model');
        }
    }
    var database = config.prisma.database || 'default';
    var stage = config.prisma.stage || 'default';
    (0, genFilesUtils_1.savePrismaYaml)(models, config.dir.prisma, "".concat(config.prisma.host, ":").concat(config.prisma.port, "/").concat(database, "/").concat(stage), config.secret);
    //saveDockerComposeYaml(config.dir.prisma, config.prisma.port)
    processedSubSchemas = [];
    for (var schemaName in CustomAction_1.CustomAction.instances) {
        var fileName = schemaName.toLowerCase();
        var action = CustomAction_1.CustomAction.getInstance(schemaName);
        var schema = mandarina_1.Schema.instances[schemaName];
        var operation = (0, genFilesUtils_1.getGraphQLOperation)(action, schema);
        (0, genFilesUtils_1.saveFile)(config.dir.prisma, fileName, operation, 'operation');
        if (!schema)
            continue;
        var graphql = (0, genFilesUtils_1.getGraphQLInput)(schema);
        (0, genFilesUtils_1.saveFile)(config.dir.prisma, fileName, graphql, 'input');
        var subSchemas = (0, genFilesUtils_1.getSubSchemas)(schema);
        for (var _a = 0, subSchemas_2 = subSchemas; _a < subSchemas_2.length; _a++) {
            var subsSchema = subSchemas_2[_a];
            if (processedSubSchemas.includes(subsSchema))
                continue;
            processedSubSchemas.push(schemaName);
            var schema_2 = mandarina_1.Schema.getInstance(subsSchema);
            var graphql_2 = (0, genFilesUtils_1.getGraphQLInput)(schema_2);
            var fileName_2 = getFileName(schema_2);
            (0, genFilesUtils_1.saveFile)(config.dir.prisma, fileName_2, graphql_2, 'input');
        }
    }
    if (config.options && config.options.auth) {
        var authOperation = (0, genFilesUtils_1.getAuthOperation)();
        (0, genFilesUtils_1.saveFile)(config.dir.prisma, 'mandarinaauth', authOperation, 'operation');
    }
};
exports.genFile = genFile;
var getFileName = function (schema) { return schema.name.toLowerCase(); };
//# sourceMappingURL=genFiles.js.map