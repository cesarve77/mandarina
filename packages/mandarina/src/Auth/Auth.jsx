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
var react_apollo_1 = require("react-apollo");
var graphql_tag_1 = require("graphql-tag");
var Auth = /** @class */ (function (_super) {
    __extends(Auth, _super);
    function Auth(props) {
        var _this = _super.call(this, props) || this;
        var action = props.action, schema = props.schema, userRoles = props.userRoles, fields = props.fields;
        var finalFields = exports.getFields({ fields: fields, action: action, schema: schema, userRoles: userRoles });
        if (finalFields === null) {
            _this.state = { loading: true, fields: [] };
        }
        else {
            _this.state = { loading: false, fields: finalFields };
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
        var _a = this.props, children = _a.children, hardCodeFields = _a.fields;
        var _b = this.state, loading = _b.loading, schemaFields = _b.fields, error = _b.error;
        console.log('hardCodeFields', hardCodeFields);
        console.log('schemaFields', schemaFields);
        var fields = hardCodeFields.filter(function (field) { return schemaFields.includes(field); });
        console.log('fields', fields);
        return children({ fields: fields, loading: loading, error: error });
    };
    return Auth;
}(react_1.Component));
exports.default = react_apollo_1.withApollo(Auth);
exports.addToSet = function (into, toBeAdded) { return toBeAdded.forEach(function (item) { return !into.includes(item) && into.push(item); }); };
var roles = new Set();
exports.authFields = {};
exports.actions = ['read', 'create', 'update', 'delete'];
exports.getRoles = function () {
    if (roles.size === 0) {
        var schemas = Object.values(__1.Schema.instances);
        schemas.forEach(function (schema) {
            var fields = schema.getFields();
            fields.forEach(function (field) {
                var permissions = schema.getPathDefinition(field).permissions;
                if (permissions.read)
                    permissions.read.forEach(function (r) { return roles.add(r); });
                if (permissions.update)
                    permissions.update.forEach(function (r) { return roles.add(r); });
                if (permissions.create)
                    permissions.create.forEach(function (r) { return roles.add(r); });
                if (permissions.delete)
                    permissions.delete.forEach(function (r) { return roles.add(r); });
            });
        });
    }
    return roles;
};
exports.getFields = function (args) {
    var allRoles = exports.getRoles();
    for (var _i = 0, _a = args.userRoles; _i < _a.length; _i++) {
        var userRole = _a[_i];
        if (!allRoles.has(userRole))
            return null;
    }
    if (!exports.actions.includes(args.action))
        throw new Error("Action only can be one of ['read', 'create', 'update', 'delete'] now is: " + args.action + " ");
    var finalFields = [];
    var t = new Date().getTime();
    args.fields.forEach(function (field) {
        if (!args.schema.hasPath(field)) {
            finalFields.push(field);
        }
        else if (args.schema.getFieldPermission(field, args.userRoles, args.action)) {
            finalFields.push(field);
        }
    });
    console.log('time', new Date().getTime() - t);
    return finalFields;
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
