"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFields = exports.actions = void 0;
var Auth = function (_a) {
    var children = _a.children, action = _a.action, schema = _a.schema, userRoles = _a.userRoles, fields = _a.fields;
    var finalFields = (0, exports.getFields)({ fields: fields, action: action, schema: schema, userRoles: userRoles });
    var childrenProps = { fields: finalFields, loading: false, error: "", readFields: [] };
    if (action === 'update') {
        childrenProps.readFields = (0, exports.getFields)({ fields: fields, action: 'read', schema: schema, userRoles: userRoles });
    }
    return children(childrenProps);
};
exports.default = Auth;
exports.actions = ['read', 'create', 'update', 'delete'];
var getFields = function (args) {
    if (!exports.actions.includes(args.action))
        throw new Error("Action only can be one of ['read', 'create', 'update', 'delete'] not: ".concat(args.action, " "));
    var finalFields = [];
    args.fields.forEach(function (field) {
        if (!args.schema.hasPath(field)) {
            finalFields.push(field);
        }
        else if (args.schema.getFieldPermission(field, args.action, args.userRoles)) {
            finalFields.push(field);
        }
    });
    return finalFields;
};
exports.getFields = getFields;
//# sourceMappingURL=Auth.js.map