"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Auth = function (_a) {
    var children = _a.children, action = _a.action, schema = _a.schema, userRoles = _a.userRoles, fields = _a.fields;
    var finalFields = exports.getFields({ fields: fields, action: action, schema: schema, userRoles: userRoles });
    var childrenProps = { fields: finalFields, loading: false, error: "", readFields: [] };
    if (action === 'update') {
        childrenProps.readFields = exports.getFields({ fields: fields, action: 'read', schema: schema, userRoles: userRoles });
    }
    return children(childrenProps);
};
exports.default = Auth;
exports.actions = ['read', 'create', 'update', 'delete'];
exports.getFields = function (args) {
    if (!exports.actions.includes(args.action))
        throw new Error("Action only can be one of ['read', 'create', 'update', 'delete'] not: " + args.action + " ");
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
//# sourceMappingURL=Auth.js.map