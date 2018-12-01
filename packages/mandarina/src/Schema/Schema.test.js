"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Schema_1 = require("./Schema");
var Validators_1 = require("./Validators");
var utils_1 = require("./utils");
require("./Validators");
var utils_2 = require("../Table/utils");
describe('Schema', function () {
    var userShape = {
        name: {
            type: String,
            description: 'name',
            label: 'name',
            validators: ['required']
        }
    };
    var schema = new Schema_1.Schema(userShape, { name: 'Schema' });
    test("constructor ", function () {
        expect(schema).toBeInstanceOf(Schema_1.Schema);
    });
    test("extend ", function () {
        schema.extend({ newField: { type: String } });
        expect(schema.shape).toHaveProperty('newField');
    });
    test("getInstance ", function () {
        expect(Schema_1.Schema.getInstance('Schema')).toBe(schema);
    });
    test("applyDefinitionsDefaults ", function () {
        var def = schema.applyDefinitionsDefaults({
            type: String,
            description: 'name',
            validators: [{ required: true }]
        }, 'name');
        expect(def).toHaveProperty('label', 'Name');
        expect(utils_1.isRequired(def)).toBe(true);
    });
    test("applyDefinitionsDefaults validator finder ", function () {
        var def = schema.applyDefinitionsDefaults({
            type: String,
            description: 'name',
            validators: [{ minNumber: 5 }, Validators_1.maxNumber.with(10), 'required']
        }, 'name');
        expect(def).toHaveProperty('label', 'Name');
        expect(utils_1.isRequired(def)).toBe(true);
        expect(def.validators[0]).toHaveProperty('name', 'Validator');
        expect(def.validators[0]).toHaveProperty('name', 'Validator');
        expect(def.validators[1]).toHaveProperty('name', 'Validator');
        expect(def.validators[2]).toHaveProperty('name', 'Validator');
    });
    test("applyDefinitionsDefaults label function", function () {
        var def = schema.applyDefinitionsDefaults({
            type: String,
            label: function () { return 'Label func'; },
            validators: ['required']
        }, 'name');
        expect(def).toHaveProperty('label', 'Label func');
        expect(utils_1.isRequired(def)).toBe(true);
    });
    test("validate valid", function () {
        var errors = schema.validate({
            name: 'test 1'
        });
        expect(errors).toHaveLength(0);
    });
    test("validate invalid extra key", function () {
        var errors = schema.validate({
            name: 'name',
            extraKey: 'test 1'
        });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toHaveProperty('validatorName', 'extraKey');
    });
    test("validate invalid ", function () {
        var errors = schema.validate({
            name: ''
        });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toHaveProperty('validatorName', 'required');
    });
});
describe('Schema type validators', function () {
    test("type String Number Integer Date", function () {
        var userShape = {
            name: {
                type: String,
                description: 'name',
                label: 'name',
                validators: ['required']
            },
            height: {
                type: Number,
                description: 'height',
                label: 'height',
                validators: ['required', { minNumber: 10 }]
            },
            age: {
                type: Schema_1.Integer,
                description: 'age',
                label: 'age',
                validators: ['required']
            },
            bod: {
                type: Date,
                description: 'date',
                label: 'date',
                validators: ['required']
            }
        };
        var schema = new Schema_1.Schema(userShape, { name: 'Profile' });
        var errors = schema.validate({
            name: '123',
            height: '5',
            age: '15',
            bod: '15/10/2018',
        });
        expect(errors[0]).toHaveProperty('label', 'height');
        expect(errors[0]).toHaveProperty('validatorName', 'isNumber');
        expect(errors[1]).toHaveProperty('label', 'age');
        expect(errors[1]).toHaveProperty('validatorName', 'isInteger');
        expect(errors[2]).toHaveProperty('label', 'date');
        expect(errors[2]).toHaveProperty('validatorName', 'isDate');
        errors = schema.validate({
            name: undefined,
            height: 5,
            age: 15.5,
            bod: new Date(),
        });
        expect(errors[0]).toHaveProperty('label', 'name');
        expect(errors[0]).toHaveProperty('validatorName', 'required');
        expect(errors[1]).toHaveProperty('label', 'height');
        expect(errors[1]).toHaveProperty('validatorName', 'minNumber');
        expect(errors[2]).toHaveProperty('label', 'age');
        expect(errors[2]).toHaveProperty('validatorName', 'isInteger');
        expect(errors[3]).toBeUndefined();
    });
});
describe('Nested Schema', function () {
    var userSchema = new Schema_1.Schema({
        name: {
            type: String,
            description: 'name',
            label: 'name',
            validators: ['required']
        },
        card: {
            type: 'NestedCard',
            description: 'card on user',
            label: 'card on user',
            validators: ['required']
        }
    }, {
        name: 'NestedUser',
        permissions: {
            create: 'admin',
            update: 'admin',
            delete: 'admin'
        }
    });
    // @ts-ignore
    var cardSchema = new Schema_1.Schema({
        number: {
            type: Number,
            description: 'number',
            label: 'number',
            validators: ['required']
        },
        user: {
            type: 'NestedUser',
            description: 'user on card',
            label: 'user on card',
            validators: ['required']
        }
    }, { name: 'NestedCard', });
    test("applyDefinitionsDefaults permissions", function () {
        var def = userSchema.getPathDefinition('card.number');
        expect(def.permissions).not.toBeUndefined();
        if (def.permissions) {
            expect(def.permissions.read).toBe(undefined);
            expect(def.permissions.update).toBe('admin');
            expect(def.permissions.create).toBe('admin');
            expect(def.permissions.delete).toBe('admin');
        }
    });
    test("validate valid omit", function () {
        var errors = userSchema.validate({
            name: 'name 1',
            card: {
                number: 123,
                user: {
                    name: 'name 2',
                    card: {
                        number: 321,
                    }
                }
            }
        });
        expect(errors).toHaveLength(0);
    });
    test("validate invalid omit", function () {
        var errors = userSchema.validate({
            name: 'name 1',
            card: {}
        });
        expect(errors).toHaveLength(1);
    });
});
describe('Nested Array Schema', function () {
    var userSchema = new Schema_1.Schema({
        name: {
            type: String,
            description: 'name',
            label: 'name',
            transformValue: function (value) { return utils_2.capitalize(value); },
            validators: ['required'],
        },
        cards: {
            type: ['CardArray'],
            description: 'card on user',
            label: 'card on user',
            validators: ['required']
        },
        description: {
            type: String
        }
    }, { name: 'UserArray', });
    // @ts-ignore
    var cardSchema = new Schema_1.Schema({
        number: {
            type: Number,
            description: 'number',
            label: 'number',
            validators: ['required']
        },
        user: {
            type: 'UserArray',
            description: 'user on card',
            label: 'user on card',
            validators: ['required']
        },
        description: {
            type: String
        }
    }, { name: 'CardArray', });
    test('getPathDefinition', function () {
        var def = userSchema.getPathDefinition('name');
        expect(def.type).toBe(String);
        def = userSchema.getPathDefinition('cards');
        expect(def.type).toMatchObject(['CardArray']);
        def = userSchema.getPathDefinition('cards.number');
        expect(def.type).toBe(Number);
        def = userSchema.getPathDefinition('cards.$.number');
        expect(def.type).toBe(Number);
        def = userSchema.getPathDefinition('cards.$.description');
        expect(def.type).toBe(String);
        def = userSchema.getPathDefinition('cards.$');
        expect(def.type).toBe('CardArray');
        def = userSchema.getPathDefinition('cards.0');
        expect(def.type).toBe('CardArray');
        def = userSchema.getPathDefinition('cards');
        expect(def.type).toMatchObject(['CardArray']);
    });
    test("validate valid omit", function () {
        var errors = userSchema.validate({
            name: 'name 1',
            cards: [{ number: 1 }, { number: 2 }, { number: 3 }, { number: 4 }]
        });
        expect(errors).toHaveLength(0);
    });
    test("validate invalid omit", function () {
        var errors = userSchema.validate({
            name: 'name 1',
            cards: [{ number: 1 }, { number: 2 }, {}, { extraKey: 4 }]
        });
        expect(errors).toHaveLength(3);
    });
    test("validate invalid is not array", function () {
        var errors = userSchema.validate({
            name: 'name 1',
            cards: {}
        });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toHaveProperty('validatorName', 'isArray');
    });
    test("validate invalid null omit", function () {
        var errors = userSchema.validate({
            name: 'name 1',
            cards: [{ number: 1 }, { number: 2 }, null, { extraKey: 4 }]
        });
        expect(errors).toHaveLength(3);
    });
    test("clean", function () {
        var model = {};
        userSchema.clean(model);
        expect(model).toMatchObject({
            name: null,
            cards: []
        });
        model = { name: 'xxxx' };
        userSchema.clean(model);
        expect(model).toMatchObject({
            name: 'xxxx',
            cards: []
        });
        model = { cards: [{}, {}] };
        userSchema.clean(model);
        expect(model).toMatchObject({
            cards: [{ number: null, user: null }, { number: null, user: null }],
            name: null
        });
        model = { name: 0.00001, cards: [{ number: '1234' }, { number: '123456.78' }] };
        userSchema.clean(model);
        expect(model).toMatchObject({
            cards: [{ number: 1234, user: null }, { number: 123456.78, user: null }],
            name: '0.00001'
        });
    });
    test("transform", function () {
        var model = { name: 'cesar', cards: [] };
        userSchema.clean(model, true);
        expect(model).toMatchObject({
            cards: [],
            name: 'Cesar'
        });
    });
});
