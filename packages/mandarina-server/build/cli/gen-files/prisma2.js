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
exports.genFile = void 0;
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
var genFile = function () {
    var _a;
    var config = (0, utils_1.getConfig)();
    (0, utils_1.loadSchemas)(config.dir);
    (0, genFilesUtils_1.createDir)(config.dir.prisma2);
    for (var schemaName in __1.Table.instances) {
        var schema = mandarina_1.Schema.getInstance(schemaName);
        getPrisma2Model(schema);
    }
    var prisma = "generator client {\n  provider = \"prisma-client-js\"\n  ".concat((_a = config.prisma) === null || _a === void 0 ? void 0 : _a.generatorClient, "\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n  directUrl = env(\"DIRECT_DATABASE_URL\")\n}\n");
    Object.keys(prisma2Models).forEach(function (modelName) {
        var model = prisma2Models[modelName];
        prisma += "model ".concat(modelName, " {\n ");
        Object.keys(model).forEach(function (fieldName) {
            var field = model[fieldName];
            prisma += "\t".concat(fieldName, " ").concat(field, "\n");
        });
        var schema = mandarina_1.Schema.getInstance(modelName);
        schema.indexes.forEach(function (_a) {
            var fields = _a.fields, type = _a.type;
            if (type === 'UNIQUE' || type === 'INDEX' || type === 'ID') {
                prisma += "\t@@".concat(type.toLowerCase(), "([").concat(fields.map(function (_a) {
                    var name = _a.name, options = _a.options;
                    return "".concat(name).concat(options ? "(".concat(options, ")") : "");
                }).join(','), "])\n");
            }
            else {
                prisma += "\t@@index([".concat(fields.map(function (_a) {
                    var name = _a.name, options = _a.options;
                    return "".concat(name).concat(options ? "(".concat(options, ")") : "");
                }).join(','), "], type: ").concat(type, ")\n");
            }
        });
        prisma += "}\n\n";
    });
    var prismaDir = path_1.default.join(process.cwd(), config.dir.prisma2);
    var fileAbs = "".concat(prismaDir, "/schema.prisma");
    fs_1.default.writeFileSync(fileAbs, prisma);
};
exports.genFile = genFile;
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
            var required = fieldDefinition.isArray || (0, utils_2.isRequired)(fieldDefinition);
            var fieldType = getGraphQLType(fieldDefinition, key, required);
            var unique = fieldDefinition.table.unique ? '@unique' : '';
            var createdAt = '', updatedAt = '';
            var defaultValue = '';
            if (fieldDefinition.table.default !== undefined) {
                var wrapper = (fieldDefinition.type === String) ? '"' : '';
                defaultValue = "@default(".concat(wrapper).concat(fieldDefinition.table.default).concat(wrapper, ")");
            }
            if ((fieldDefinition.table.createdAt === true || (fieldDefinition.table.createdAt !== false && key === 'createdAt'))) {
                createdAt = "@default(now())";
            }
            if ((fieldDefinition.table.updatedAt === true || (fieldDefinition.table.updatedAt !== false && key === 'updatedAt'))) {
                updatedAt = "@updatedAt";
            }
            if (fieldDefinition.table.default !== undefined) {
                var wrapper = (fieldDefinition.type === String) ? '"' : '';
                defaultValue = "@default(".concat(wrapper).concat(fieldDefinition.table.default).concat(wrapper, ")");
            }
            if (fieldDefinition.isTable) {
                getPrismaModelAModelB(schema, fieldDefinition);
                if (!processedSubSchemas.includes(fieldDefinition.type)) {
                    processedSubSchemas.push(fieldDefinition.type);
                    getPrisma2Model(mandarina_1.Schema.getInstance(fieldDefinition.type));
                }
            }
            else {
                prisma2Models[schema.name][key] = "".concat(fieldType, " ").concat(unique, " ").concat(createdAt, " ").concat(updatedAt, " ").concat(defaultValue);
            }
        }
    } // end for
};
var c = 0;
var getPrismaModelAModelB = function (schema, fieldDefinition) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
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
                    var relation = getRelationName(fieldDefinition, child) || "".concat(schema.name, "To").concat(schema.name);
                    var fields = "p2".concat(fieldDefinition.key, "Id");
                    if (((_b = (_a = fieldDefinition.table) === null || _a === void 0 ? void 0 : _a.relation) === null || _b === void 0 ? void 0 : _b.type) === 'MANY_TO_MANY') {
                        throw new Error("DO THIS");
                    }
                    else if (((_d = (_c = fieldDefinition.table) === null || _c === void 0 ? void 0 : _c.relation) === null || _d === void 0 ? void 0 : _d.type) === 'ONE_TO_MANY') {
                        prisma2Models[schema.name][fieldDefinition.key] = "".concat(schema.name, "? ").concat(buildRelation(relation, fields), " //SELF: 1 - N ((").concat(c, "))");
                        prisma2Models[schema.name][fields] = "String? //SELF: 1 - N ((".concat(c, "))");
                        prisma2Models[schema.name]["p2Predecessor".concat(schema.name)] = "".concat(schema.name, "[] ").concat(buildRelation(relation), "//SELF: N - 1 ((").concat(c, "))");
                    }
                    else { //ONT_TO_ONE
                        prisma2Models[schema.name][fieldDefinition.key] = "".concat(schema.name, "? ").concat(buildRelation(relation, fields), " //SELF: 1 - 1 ((").concat(c, "))");
                        prisma2Models[schema.name][fields] = "String? @unique //SELF: 1 - 1 ((".concat(c, "))");
                        prisma2Models[schema.name]["p2Predecessor".concat(schema.name)] = "".concat(schema.name, "? ").concat(buildRelation(relation), "//SELF: 1 - 1 ((").concat(c, "))");
                    }
                }
            }
        }
        else {
            if (children.length === 0) {
                var relation = getRelationName(fieldDefinition);
                if (fieldDefinition.isArray) {
                    if (!((_f = (_e = fieldDefinition.table) === null || _e === void 0 ? void 0 : _e.relation) === null || _f === void 0 ? void 0 : _f.type) || !['MANY_TO_MANY', 'ONE_TO_MANY'].includes((_h = (_g = fieldDefinition.table) === null || _g === void 0 ? void 0 : _g.relation) === null || _h === void 0 ? void 0 : _h.type)) {
                        throw new Error("Relation must be defined MANY_TO_MANY || ONE_TO_MANY- ".concat(schema.name, ".").concat(fieldDefinition.key));
                    }
                    if (((_k = (_j = fieldDefinition.table) === null || _j === void 0 ? void 0 : _j.relation) === null || _k === void 0 ? void 0 : _k.type) === 'ONE_TO_MANY') {
                        //relation many to one
                        prisma2Models[schema.name][fieldDefinition.key] = "".concat(fieldDefinition.type, "[] ").concat(buildRelation(relation), "//CREATE: n - 1 ((").concat(c, "))");
                        var fields = "p2".concat(relation).concat(schema.name, "Id");
                        prisma2Models[fieldDefinition.type]["p2".concat(relation).concat(schema.name)] = "".concat(schema.name, "? ").concat(buildRelation(relation, fields), "  //=>CREATE: n - 1 ((").concat(c, "))");
                        prisma2Models[fieldDefinition.type][fields] = "String? //=>CREATE:n - n  no children ((".concat(c, "))");
                    }
                    else if (((_m = (_l = fieldDefinition.table) === null || _l === void 0 ? void 0 : _l.relation) === null || _m === void 0 ? void 0 : _m.type) === 'MANY_TO_MANY') {
                        //relation many to many
                        prisma2Models[schema.name][fieldDefinition.key] = "".concat(fieldDefinition.type, "[] ").concat(buildRelation(relation), "//CREATE: n - 1 ((").concat(c, "))");
                        prisma2Models[fieldDefinition.type]["p2".concat(relation).concat(schema.name)] = "".concat(schema.name, "[] //=>CREATE: n - n no children((").concat(c, "))");
                    }
                }
                else {
                    if (!((_p = (_o = fieldDefinition.table) === null || _o === void 0 ? void 0 : _o.relation) === null || _p === void 0 ? void 0 : _p.type)) {
                        throw new Error("Relation must be defined ONE_TO_ONE || ONE_TO_MANY- ".concat(schema.name, ".").concat(fieldDefinition.key));
                    }
                    if (((_r = (_q = fieldDefinition.table) === null || _q === void 0 ? void 0 : _q.relation) === null || _r === void 0 ? void 0 : _r.type) === 'ONE_TO_ONE') {
                        var fields = "p2".concat(relation).concat(schema.name, "Id");
                        prisma2Models[schema.name][fieldDefinition.key] = "".concat(fieldDefinition.type, "? ").concat(buildRelation(relation), "//INLINE : 1 - 1 ((").concat(c, "))");
                        prisma2Models[fieldDefinition.type]["p2".concat(relation).concat(schema.name)] = "".concat(schema.name, "?  ").concat(buildRelation(relation, fields), " //=>INLINE: 1 - 1 ((").concat(c, "))");
                        prisma2Models[fieldDefinition.type][fields] = "String?  @unique //=>INLINE: 1 - 1 ((".concat(c, "))");
                    }
                    else if (((_t = (_s = fieldDefinition.table) === null || _s === void 0 ? void 0 : _s.relation) === null || _t === void 0 ? void 0 : _t.type) === 'ONE_TO_MANY') {
                        var fields = "p2".concat(relation).concat(fieldDefinition.type, "Id");
                        prisma2Models[schema.name][fieldDefinition.key] = "".concat(fieldDefinition.type, "? ").concat(buildRelation(relation, fields), "//CREATE: 1 - n ((").concat(c, "))");
                        prisma2Models[schema.name][fields] = "String? //=>CREATE: 1 - n ((".concat(c, "))");
                        prisma2Models[fieldDefinition.type]["p2".concat(relation).concat(schema.name)] = "".concat(schema.name, "[]  ").concat(buildRelation(relation), " //=>CREATE: 1 - n ((").concat(c, "))");
                    }
                    else {
                        throw new Error("many to one does no exists for create - ".concat(schema.name, ".").concat(fieldDefinition.key));
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
                        prisma2Models[schema.name][fieldDefinition.key] = "".concat(fieldDefinition.type, "[]  ").concat(buildRelation(relation), " //n - n ((").concat(c, "))");
                        prisma2Models[fieldDefinition.type][child.key] = "".concat(child.type, "[] ").concat(buildRelation(relation), " //=>n - n ((").concat(c, "))");
                    }
                    else {
                        //relation one to many
                        var relation_1 = getRelationName(fieldDefinition, child);
                        var fields = "p2".concat(relation_1).concat(fieldDefinition.type, "Id");
                        prisma2Models[schema.name][fieldDefinition.key] = "".concat(fieldDefinition.type, "?   ").concat(buildRelation(relation_1, fields), " //n - 1 ((").concat(c, "))");
                        prisma2Models[schema.name][fields] = "String?  //n - 1 ((".concat(c, "))");
                        prisma2Models[fieldDefinition.type][child.key] = "".concat(schema.name, " [] ").concat(buildRelation(relation_1), "//=>n - 1 ((").concat(c, "))");
                    }
                }
                else {
                    var relation = getRelationName(fieldDefinition, child);
                    if (fieldDefinition.isArray) {
                        //relation many to many
                        var fields = "p2".concat(relation).concat(schema.name, "Id");
                        prisma2Models[schema.name][fieldDefinition.key] = "".concat(fieldDefinition.type, "[] ").concat(buildRelation(relation), "//1 - n ((").concat(c, "))");
                        prisma2Models[fieldDefinition.type][child.key] = "".concat(schema.name, "?  ").concat(buildRelation(relation, fields), " //=>n - 1 ((").concat(c, "))");
                        prisma2Models[fieldDefinition.type][fields] = "String?  //=>n - 1 ((".concat(c, "))");
                    }
                    else {
                        if (!((_v = (_u = fieldDefinition.table) === null || _u === void 0 ? void 0 : _u.relation) === null || _v === void 0 ? void 0 : _v.owner) && !((_x = (_w = child.table) === null || _w === void 0 ? void 0 : _w.relation) === null || _x === void 0 ? void 0 : _x.owner)) {
                            throw new Error("Relation must be defined a owner - ".concat(schema.name, ".").concat(fieldDefinition.key));
                        }
                        if (((_z = (_y = fieldDefinition.table) === null || _y === void 0 ? void 0 : _y.relation) === null || _z === void 0 ? void 0 : _z.owner) && ((_1 = (_0 = child.table) === null || _0 === void 0 ? void 0 : _0.relation) === null || _1 === void 0 ? void 0 : _1.owner)) {
                            throw new Error("Relation booth can not be a owner - ".concat(schema.name, ".").concat(fieldDefinition.key));
                        }
                        if ((_3 = (_2 = fieldDefinition.table) === null || _2 === void 0 ? void 0 : _2.relation) === null || _3 === void 0 ? void 0 : _3.owner) {
                            var fields = "p2".concat(relation).concat(schema.name, "Id");
                            prisma2Models[schema.name][fieldDefinition.key] = "".concat(fieldDefinition.type, "? ").concat(buildRelation(relation), "//OWNER 1 - 1 ((").concat(c, "))");
                            prisma2Models[fieldDefinition.type][child.key] = "".concat(schema.name, "?  ").concat(buildRelation(relation, fields), " //OWNER =>1 - 1 ((").concat(c, "))");
                            prisma2Models[fieldDefinition.type][fields] = "String?  @unique //OWNER =>1 - 1 ((".concat(c, "))");
                        }
                        else {
                            var fields = "p2".concat(relation).concat(fieldDefinition.type, "Id");
                            prisma2Models[schema.name][fieldDefinition.key] = "".concat(fieldDefinition.type, "? ").concat(buildRelation(relation, fields), "//OWNED 1 - 1 ((").concat(c, "))");
                            prisma2Models[schema.name][fields] = "String?  @unique  //OWNED =>1 - 1 ((".concat(c, "))");
                            prisma2Models[fieldDefinition.type][child.key] = "".concat(child.type, "? ").concat(buildRelation(relation), " //OWNED =>1 - 1 ((").concat(c, "))");
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
            return "String".concat(optional);
        case (!def.isArray && !def.isTable && def.type.name === 'Boolean'):
            return "Boolean".concat(optional);
        case (!def.isArray && !def.isTable && def.type.name === 'Number'):
            return "Float".concat(optional);
        case (!def.isArray && !def.isTable && def.type.name === 'Integer'):
            return "Int".concat(optional);
        case (!def.isArray && !def.isTable && def.type.name === 'Date'):
            return "DateTime".concat(optional);
        case (def.isArray && def.isTable):
            return "".concat(def.type, "[]");
        case (def.isArray && !def.isTable):
            var scalarName = getGraphQLType(__assign(__assign({}, def), { isArray: false }), key, def.isArray && required);
            return "".concat(scalarName, "[]");
        default:
            return def.type + optional;
    }
};
function buildRelation(relation, fields) {
    if (!relation && !fields)
        return '';
    if (!relation)
        return "@relation(fields: [".concat(fields, "],  references: [id])");
    if (fields) {
        return "@relation(\"".concat(relation, "\", fields: [").concat(fields, "],  references: [id])");
    }
    return "@relation(\"".concat(relation, "\")");
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
        throw new Error("Relation name must be equal ".concat(n1, " ").concat(n2));
    }
    if (!n1)
        return "";
    return n1;
};
//# sourceMappingURL=prisma2.js.map