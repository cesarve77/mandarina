"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jsdom-global/register");
var mandarina_1 = require("mandarina");
var enzyme_1 = require("enzyme");
var enzyme_adapter_react_16_1 = require("enzyme-adapter-react-16");
var AutoForm_1 = require("uniforms-antd/AutoForm");
var React = require("react");
var Bridge_1 = require("./Bridge");
enzyme_1.default.configure({ adapter: new enzyme_adapter_react_16_1.default() });
// @ts-ignore
var cardSchema = new mandarina_1.Table({
    number: {
        type: Number,
        description: 'number',
        label: 'number',
        validators: ['required', { 'isAllowed': [0, 1, 2, 3, 4, 5] }]
    }
}, { name: 'Card' });
var userSchema = new mandarina_1.Table({
    name: {
        type: String,
        description: 'name',
        label: 'name',
        validators: ['required'],
    },
    cards: {
        type: ['Card'],
        description: 'card on user',
        label: 'card on user',
        validators: ['required']
    }
}, { name: 'User', });
describe('Form', function () {
    test("CreateForm", function () {
        enzyme_1.mount(<AutoForm_1.default schema={new Bridge_1.Bridge(userSchema)}/>);
    });
});
