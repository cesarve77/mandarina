"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var __1 = require("..");
var utils_1 = require("../utils");
var react_apollo_1 = require("react-apollo");
var graphql_tag_1 = require("graphql-tag");
var Auth = /** @class */ (function (_super) {
    __extends(Auth, _super);
    function Auth(props) {
        var _this = _super.call(this, props) || this;
        var action = props.action, schema = props.schema, userRoles = props.userRoles;
        var fields = exports.getFields({ action: action, schema: schema, userRoles: userRoles });
        if (fields === null) {
            _this.state = { loading: true, fields: [] };
        }
        else {
            _this.state = { loading: false, fields: fields };
        }
        return _this;
    }
    Auth.prototype.componentDidMount = function () {
        var _this = this;
        if (this.state.loading) {
            var _a = this.props, action = _a.action, schema = _a.schema;
            var QUERY = graphql_tag_1.default(templateObject_1 || (templateObject_1 = __makeTemplateObject(["query fields ($action: String!, $table:String!) {AuthFields(action: $action, table: $table) }"], ["query fields ($action: String!, $table:String!) {AuthFields(action: $action, table: $table) }"])));
            this.props.client.query({
                query: QUERY,
                variables: { action: action, table: schema.name }
            })
                .then(function (_a) {
                var fields = _a.data.fields;
                _this.setState({ loading: false, fields: fields });
            })
                .catch(function (error) { return _this.setState({ loading: false, error: error }); });
        }
    };
    Auth.prototype.render = function () {
        var _a = this.props, children = _a.children, optionalFields = _a.fields, omitFields = _a.omitFields, omitFieldsRegEx = _a.omitFieldsRegEx;
        var _b = this.state, loading = _b.loading, authFields = _b.fields, error = _b.error;
        var fields = authFields ? utils_1.filterFields(authFields, optionalFields, omitFields, omitFieldsRegEx) : undefined;
        return children({ fields: fields, loading: loading, error: error });
    };
    return Auth;
}(react_1.Component));
exports.default = react_apollo_1.withApollo(Auth);
exports.addToSet = function (into, toBeAdded) { return toBeAdded.forEach(function (item) { return !into.includes(item) && into.push(item); }); };
var roles = [];
exports.authFields = {};
exports.actions = ['read', 'create', 'update', 'delete'];
exports.getRoles = function () {
    if (roles.length === 0) {
        var schemas = Object.values(__1.Schema.instances);
        schemas.forEach(function (schema) {
            exports.authFields[schema.name] = exports.authFields[schema.name] || { read: {}, create: {}, update: {}, delete: {} };
            var permissions = schema.getPermissions();
            exports.actions.forEach(function (action) {
                var tableRoles = Object.keys(permissions[action]);
                tableRoles.forEach(function (role) {
                    exports.authFields[schema.name][action][role] = permissions[action][role];
                    if (role && !roles.includes(role)) {
                        roles.push(role);
                    }
                });
            });
        });
    }
    return roles;
};
exports.getFields = function (args) {
    var allRoles = exports.getRoles();
    if (!exports.actions.includes(args.action))
        throw new Error("Action only can be one of ['read', 'create', 'update', 'delete'] now is: " + args.action + " ");
    if (!exports.authFields[args.schema.name])
        throw new Error("Table " + args.schema + " not found getting AuthFields ");
    var allTableFields = args.schema.getFields();
    var tablePermissions = args.schema.getPermissions();
    var everyone = tablePermissions[args.action].everyone;
    var fields = everyone ? everyone : [];
    var extraRoles = [];
    args.userRoles.forEach(function (role) {
        if (allRoles.includes(role)) {
            exports.addToSet(fields, exports.authFields[args.schema.name][args.action][role] || []);
        }
        else {
            extraRoles.push(role);
        }
    });
    if (!extraRoles.length)
        return allTableFields.filter(function (field) { return fields.includes(field); }); // for keep the order
    return null;
    /*const staticRoles = roles.filter(permissionRoles.includes)
    const dynamicRoles = roles.filter((field: string) => !permissionRoles.includes(field))


    const table = Table.getInstance(args.table)
    const permissions = table.options.permissions
    const userId = Table.config.getUserId(context)

    if (permissions && permissions[args.action]) {
        if (permissions[args.action] === 'everyone') return table.schema.getFields()
        if (permissions[args.action] === 'nobody') return null
        if (permissions[args.action] === 'logged' && userId) return table.schema.getFields()
        const permissionRoles = permissions[args.action].split('|')


        const result: string[] = []
        if (staticRoles.length) {

        }
        if (dynamicRoles.length) {
            const response = await context.prisma.query.authTables({
                where: {
                    role_in: userRoles,
                    table: args.table,
                    action: args.action,
                }
            })
            const fields = response && response.data && response.data.authTables
            if (fields) return result.concat(fields)
        }
        return result.length ? result : null
    }
    return table.schema.getFields()*/
};
var templateObject_1;
