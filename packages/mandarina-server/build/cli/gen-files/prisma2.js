"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var genFilesUtils_1 = require("./genFilesUtils");
var __1 = require("../..");
var mandarina_1 = require("mandarina");
var utils_2 = require("mandarina/build/Schema/utils");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var prisma2Models = {};
var processed = {};
var processedSubSchemas = [];
exports.genFile = function () {
    var config = utils_1.getConfig();
    utils_1.loadSchemas(config.dir);
    genFilesUtils_1.createDir(config.dir.prisma2);
    for (var schemaName in __1.Table.instances) {
        var schema = mandarina_1.Schema.getInstance(schemaName);
        getPrisma2Model(schema);
    }
    var prisma = "generator client {\n  provider = \"prisma-client-js\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n";
    Object.keys(prisma2Models).forEach(function (modelName) {
        var model = prisma2Models[modelName];
        prisma += "model " + modelName + " {\n ";
        Object.keys(model).forEach(function (fieldName) {
            var field = model[fieldName];
            prisma += "\t" + fieldName + " " + field + "\n";
        });
        prisma += "}\n\n";
    });
    var prismaDir = path_1.default.join(process.cwd(), config.dir.prisma2);
    var fileAbs = prismaDir + "/schema.prisma";
    fs_1.default.writeFileSync(fileAbs, prisma);
};
var getPrisma2Model = function (schema) {
    prisma2Models[schema.name] = prisma2Models[schema.name] || {};
    for (var _i = 0, _a = schema.keys; _i < _a.length; _i++) {
        var key = _a[_i];
        if (key === 'id') {
            c++;
            prisma2Models[schema.name].id = "String                 @id @default(cuid()) //";
        }
        else {
            var fieldDefinition = schema.getPathDefinition(key);
            var required = fieldDefinition.isArray || utils_2.isRequired(fieldDefinition);
            var fieldType = getGraphQLType(fieldDefinition, key, required);
            var unique = fieldDefinition.table.unique ? '@unique' : '';
            var createdAt = '', updatedAt = '';
            var defaultValue = '';
            if (fieldDefinition.table.default !== undefined) {
                var wrapper = (fieldDefinition.type === String) ? '"' : '';
                defaultValue = "@default(" + wrapper + fieldDefinition.table.default + wrapper + ")";
            }
            if ((fieldDefinition.table.createdAt === true || (fieldDefinition.table.createdAt !== false && key === 'createdAt'))) {
                createdAt = "@default(now())";
            }
            if ((fieldDefinition.table.updatedAt === true || (fieldDefinition.table.updatedAt !== false && key === 'updatedAt'))) {
                createdAt = "@default(now())";
            }
            if (fieldDefinition.table.default !== undefined) {
                var wrapper = (fieldDefinition.type === String) ? '"' : '';
                defaultValue = "@default(" + wrapper + fieldDefinition.table.default + wrapper + ")";
            }
            if (fieldDefinition.isTable) {
                getPrismaModelAModelB(schema, fieldDefinition);
                if (!processedSubSchemas.includes(fieldDefinition.type)) {
                    processedSubSchemas.push(fieldDefinition.type);
                    getPrisma2Model(mandarina_1.Schema.getInstance(fieldDefinition.type));
                }
            }
            else {
                prisma2Models[schema.name][key] = fieldType + " " + unique + " " + createdAt + " " + updatedAt + " " + defaultValue;
            }
        }
    } // end for
};
var c = 0;
var getPrismaModelAModelB = function (schema, fieldDefinition) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    if (!fieldDefinition.isTable) {
        throw new Error("Relation must be an array");
    }
    processed[schema.name] = processed[schema.name] || {};
    processed[schema.name][fieldDefinition.type] = processed[schema.name][fieldDefinition.type] || {};
    prisma2Models[fieldDefinition.type] = prisma2Models[fieldDefinition.type] || {};
    prisma2Models[schema.name] = prisma2Models[schema.name] || {};
    c++;
    var childSchema = mandarina_1.Schema.getInstance(fieldDefinition.type);
    var children = childSchema.keys.filter(function (fieldName) { return childSchema.getPathDefinition(fieldName).type === schema.name; });
    if (!processed[schema.name][fieldDefinition.type][fieldDefinition.key]) {
        if (schema.name === fieldDefinition.type) {
            if (fieldDefinition.isArray) {
                throw new Error("DO THIS");
            }
            else {
                if (fieldDefinition.isArray) {
                    throw new Error("DO THIS");
                }
                else {
                    var child = schema.getPathDefinition(fieldDefinition.key);
                    if (getRelation(fieldDefinition) !== getRelation(child)) {
                        throw new Error("Relation must be the same");
                    }
                    var relation = getRelationName(fieldDefinition, child) || schema.name + "To" + schema.name;
                    var fields = "p2" + fieldDefinition.key + "Id";
                    prisma2Models[schema.name][fieldDefinition.key] = schema.name + "? " + buildRelation(relation, fields) + " //SELF: 1 - 1 ((" + c + "))";
                    prisma2Models[schema.name][fields] = "String? @unique //SELF: 1 - 1 ((" + c + "))";
                    prisma2Models[schema.name]["p2Predecessor" + schema.name] = schema.name + "? " + buildRelation(relation) + "//SELF: 1 - 1 ((" + c + "))";
                }
            }
        }
        else {
            if (children.length === 0) {
                var relation = getRelationName(fieldDefinition);
                if (fieldDefinition.isArray) {
                    //relation many to one
                    prisma2Models[schema.name][fieldDefinition.key] = fieldDefinition.type + "[] " + buildRelation(relation) + "//CREATE: n - 1 ((" + c + "))";
                    var fields = "p2" + relation + schema.name + "Id";
                    prisma2Models[fieldDefinition.type]["p2" + relation + schema.name] = schema.name + "? " + buildRelation(relation, fields) + "  //=>CREATE: n - 1 ((" + c + "))";
                    prisma2Models[fieldDefinition.type][fields] = "String? //=>CREATE: 1 - n ((" + c + "))";
                }
                else {
                    if (!((_b = (_a = fieldDefinition.table) === null || _a === void 0 ? void 0 : _a.relation) === null || _b === void 0 ? void 0 : _b.type)) {
                        throw new Error("Relation must be defined ONE_TO_ONE || ONE_TO_MANY- " + schema.name + "." + fieldDefinition.key);
                    }
                    if (((_d = (_c = fieldDefinition.table) === null || _c === void 0 ? void 0 : _c.relation) === null || _d === void 0 ? void 0 : _d.type) === 'ONE_TO_ONE') {
                        var fields = "p2" + relation + schema.name + "Id";
                        prisma2Models[schema.name][fieldDefinition.key] = fieldDefinition.type + "? " + buildRelation(relation) + "//INLINE : 1 - 1 ((" + c + "))";
                        prisma2Models[fieldDefinition.type]["p2" + relation + schema.name] = schema.name + "?  " + buildRelation(relation, fields) + " //=>INLINE: 1 - 1 ((" + c + "))";
                        prisma2Models[fieldDefinition.type][fields] = "String?  @unique //=>INLINE: 1 - 1 ((" + c + "))";
                    }
                    else if (((_f = (_e = fieldDefinition.table) === null || _e === void 0 ? void 0 : _e.relation) === null || _f === void 0 ? void 0 : _f.type) === 'ONE_TO_MANY') {
                        var fields = "p2" + relation + fieldDefinition.type + "Id";
                        prisma2Models[schema.name][fieldDefinition.key] = fieldDefinition.type + "? " + buildRelation(relation, fields) + "//CREATE: 1 - n ((" + c + "))";
                        prisma2Models[schema.name][fields] = "String? //=>CREATE: 1 - n ((" + c + "))";
                        prisma2Models[fieldDefinition.type]["p2" + relation + schema.name] = schema.name + "[]  " + buildRelation(relation) + " //=>CREATE: 1 - n ((" + c + "))";
                    }
                    else {
                        throw new Error("many to one does no exists for create - " + schema.name + "." + fieldDefinition.key);
                    }
                }
            }
            else if (children.length >= 1) {
                var child = void 0;
                if (children.length === 1) {
                    child = childSchema.getPathDefinition(children[0]);
                }
                else {
                    var childName = children.find(function (childName) { return getRelation(childSchema.getPathDefinition(childName)) === getRelation(fieldDefinition); });
                    if (!childName) {
                        throw new Error("Relation not found111");
                    }
                    child = childSchema.getPathDefinition(childName);
                }
                if (!child) {
                    throw new Error("Relation not found222");
                }
                if (child.isArray) { // means that the parent is the array (because fieldDefinition.isArray is array then child is the gran children which is really the parent)
                    var relation = getRelationName(fieldDefinition, child);
                    if (fieldDefinition.isArray) {
                        //relation many to many
                        prisma2Models[schema.name][fieldDefinition.key] = fieldDefinition.type + "[]  " + buildRelation(relation) + " //n - n ((" + c + "))";
                        prisma2Models[fieldDefinition.type][child.key] = child.type + "[] " + buildRelation(relation) + " //=>n - n ((" + c + "))";
                    }
                    else {
                        //relation one to many
                        var relation_1 = getRelationName(fieldDefinition, child);
                        var fields = "p2" + relation_1 + fieldDefinition.type + "Id";
                        prisma2Models[schema.name][fieldDefinition.key] = fieldDefinition.type + "?   " + buildRelation(relation_1, fields) + " //n - 1 ((" + c + "))";
                        prisma2Models[schema.name][fields] = "String?  //n - 1 ((" + c + "))";
                        prisma2Models[fieldDefinition.type][child.key] = schema.name + " [] " + buildRelation(relation_1) + "//=>n - 1 ((" + c + "))";
                    }
                }
                else {
                    var relation = getRelationName(fieldDefinition, child);
                    if (fieldDefinition.isArray) {
                        //relation many to many
                        var fields = "p2" + relation + schema.name + "Id";
                        prisma2Models[schema.name][fieldDefinition.key] = fieldDefinition.type + "[] " + buildRelation(relation) + "//1 - n ((" + c + "))";
                        prisma2Models[fieldDefinition.type][child.key] = schema.name + "?  " + buildRelation(relation, fields) + " //=>n - 1 ((" + c + "))";
                        prisma2Models[fieldDefinition.type][fields] = "String?  //=>n - 1 ((" + c + "))";
                    }
                    else {
                        if (!((_h = (_g = fieldDefinition.table) === null || _g === void 0 ? void 0 : _g.relation) === null || _h === void 0 ? void 0 : _h.owner) && !((_k = (_j = child.table) === null || _j === void 0 ? void 0 : _j.relation) === null || _k === void 0 ? void 0 : _k.owner)) {
                            throw new Error("Relation must be defined a owner - " + schema.name + "." + fieldDefinition.key);
                        }
                        if (((_m = (_l = fieldDefinition.table) === null || _l === void 0 ? void 0 : _l.relation) === null || _m === void 0 ? void 0 : _m.owner) && ((_p = (_o = child.table) === null || _o === void 0 ? void 0 : _o.relation) === null || _p === void 0 ? void 0 : _p.owner)) {
                            throw new Error("Relation booth can not be a owner - " + schema.name + "." + fieldDefinition.key);
                        }
                        if ((_r = (_q = fieldDefinition.table) === null || _q === void 0 ? void 0 : _q.relation) === null || _r === void 0 ? void 0 : _r.owner) {
                            var fields = "p2" + relation + schema.name + "Id";
                            prisma2Models[schema.name][fieldDefinition.key] = fieldDefinition.type + "? " + buildRelation(relation) + "//OWNER 1 - 1 ((" + c + "))";
                            prisma2Models[fieldDefinition.type][child.key] = schema.name + "?  " + buildRelation(relation, fields) + " //OWNER =>1 - 1 ((" + c + "))";
                            prisma2Models[fieldDefinition.type][fields] = "String?  @unique //OWNER =>1 - 1 ((" + c + "))";
                        }
                        else {
                            var fields = "p2" + relation + fieldDefinition.type + "Id";
                            prisma2Models[schema.name][fieldDefinition.key] = fieldDefinition.type + "? " + buildRelation(relation, fields) + "//OWNED 1 - 1 ((" + c + "))";
                            prisma2Models[schema.name][fields] = "String?  @unique  //OWNED =>1 - 1 ((" + c + "))";
                            prisma2Models[fieldDefinition.type][child.key] = child.type + "? " + buildRelation(relation) + " //OWNED =>1 - 1 ((" + c + "))";
                        }
                    }
                }
                processed[fieldDefinition.type] = processed[fieldDefinition.type] || {};
                processed[fieldDefinition.type][schema.name] = processed[fieldDefinition.type][schema.name] || {};
                processed[fieldDefinition.type][schema.name][child.key] = true;
            }
            else {
                throw new Error("Relation must be have name");
            }
        }
    }
};
function getRelation(fieldDefinition) {
    if (!fieldDefinition.table.relation)
        return '';
    if (typeof fieldDefinition.table.relation === 'string') {
        return fieldDefinition.table.relation;
    }
    return fieldDefinition.table.relation.name || '';
}
var getGraphQLType = function (def, key, required) {
    var optional = !def.isArray && !required ? '?' : '';
    switch (true) {
        case (!def.isArray && !def.isTable && def.type.name === 'String'):
            return "String" + optional;
        case (!def.isArray && !def.isTable && def.type.name === 'Boolean'):
            return "Boolean" + optional;
        case (!def.isArray && !def.isTable && def.type.name === 'Number'):
            return "Float" + optional;
        case (!def.isArray && !def.isTable && def.type.name === 'Integer'):
            return "Int" + optional;
        case (!def.isArray && !def.isTable && def.type.name === 'Date'):
            return "DateTime" + optional;
        case (def.isArray && def.isTable):
            return def.type + "[]";
        case (def.isArray && !def.isTable):
            var scalarName = getGraphQLType(__assign(__assign({}, def), { isArray: false }), key, def.isArray && required);
            return scalarName + "[]";
        default:
            return def.type + optional;
    }
};
function buildRelation(relation, fields) {
    if (!relation && !fields)
        return '';
    if (!relation)
        return "@relation(fields: [" + fields + "],  references: [id])";
    if (fields) {
        return "@relation(\"" + relation + "\", fields: [" + fields + "],  references: [id])";
    }
    return "@relation(\"" + relation + "\")";
}
var getRelationName = function (def1, def2) {
    var n1 = getRelation(def1);
    if (!def2) {
        if (!n1) {
            return '';
        }
        return n1;
    }
    var n2 = getRelation(def2);
    if (n1 !== n2) {
        throw new Error("Relation name must be equal " + n1 + " " + n2);
    }
    if (!n1)
        return "";
    return n1;
};
//# sourceMappingURL=prisma2.js.map