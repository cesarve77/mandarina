import {Integer, Schema} from "./Schema";
import {maxNumber} from "./Validators";
import {isRequired} from "./utils";
import './Validators'
import {capitalize} from "../Table/utils";


describe('Schema', () => {
    const userShape = {
        name: {
            type: String,
            description: 'name',
            label: 'name',
            validators: ['required']
        }
    }
    const schema = new Schema(userShape, {name: 'Schema'})

    test("constructor ", () => {
        expect(schema).toBeInstanceOf(Schema);
    });

    test("extend ", () => {
        schema.extend({newField: {type: String}})
        expect(schema.shape).toHaveProperty('newField');
    });


    test("getInstance ", () => {
        expect(Schema.getInstance('Schema')).toBe(schema);
    });

    test("applyDefinitionsDefaults ", () => {
        const def = schema.applyDefinitionsDefaults({
            type: String,
            description: 'name',
            validators: [{required: true}]
        }, 'name')
        expect(def).toHaveProperty('label', 'Name');
        expect(isRequired(def)).toBe(true)
    });

    test("applyDefinitionsDefaults validator finder ", () => {
        const def = schema.applyDefinitionsDefaults({
            type: String,
            description: 'name',
            validators: [{minNumber: 5}, maxNumber.with(10), 'required']
        }, 'name')
        expect(def).toHaveProperty('label', 'Name');
        expect(isRequired(def)).toBe(true)
        expect(def.validators[0]).toHaveProperty('name', 'Validator')
        expect(def.validators[0]).toHaveProperty('name', 'Validator')
        expect(def.validators[1]).toHaveProperty('name', 'Validator')
        expect(def.validators[2]).toHaveProperty('name', 'Validator')
    });

    test("applyDefinitionsDefaults label function", () => {
        const def = schema.applyDefinitionsDefaults({
            type: String,
            label: () => 'Label func',
            validators: ['required']
        }, 'name')

        expect(def).toHaveProperty('label', 'Label func',);
        expect(isRequired(def)).toBe(true)
    });


    test("validate valid", () => {
        const errors = schema.validate({
            name: 'test 1'
        })
        expect(errors).toHaveLength(0)
    });

    test("validate invalid extra key", () => {
        const errors = schema.validate({
            name: 'name',
            extraKey: 'test 1'
        })
        expect(errors).toHaveLength(1)
        expect(errors[0]).toHaveProperty('validatorName', 'extraKey')
    });

    test("validate invalid ", () => {
        const errors = schema.validate({
            name: ''
        })
        expect(errors).toHaveLength(1)
        expect(errors[0]).toHaveProperty('validatorName', 'required')
    });


})


describe('Schema type validators', () => {

    test("type String Number Integer Date", () => {
        const userShape = {
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
                validators: ['required', {minNumber: 10}]
            },
            age: {
                type: Integer,
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
        }

        const schema = new Schema(userShape, {name: 'Profile'})
        let errors = schema.validate({
            name: '123',
            height: '5',
            age: '15',
            bod: '15/10/2018',
        })
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
        })
        expect(errors[0]).toHaveProperty('label', 'name');
        expect(errors[0]).toHaveProperty('validatorName', 'required');
        expect(errors[1]).toHaveProperty('label', 'height');
        expect(errors[1]).toHaveProperty('validatorName', 'minNumber');
        expect(errors[2]).toHaveProperty('label', 'age');
        expect(errors[2]).toHaveProperty('validatorName', 'isInteger');
        expect(errors[3]).toBeUndefined();

    });
})


describe('Nested Schema', () => {
    const userSchema = new Schema({
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
    })

    // @ts-ignore
    const cardSchema = new Schema({
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
    }, {name: 'NestedCard',})

    test("applyDefinitionsDefaults permissions", () => {

        const def = userSchema.getPathDefinition('card.number')
        expect(def.permissions).not.toBeUndefined()
        if (def.permissions) {
            expect(def.permissions.read).toBe(undefined)
            expect(def.permissions.update).toBe('admin')
            expect(def.permissions.create).toBe('admin')
            expect(def.permissions.delete).toBe('admin')
        }

    });
    test("validate valid omit", () => {
        const errors = userSchema.validate({
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

        })
        expect(errors).toHaveLength(0)
    });

    test("validate invalid omit", () => {
        const errors = userSchema.validate({
            name: 'name 1',
            card: {}

        })
        expect(errors).toHaveLength(1)
    });


})


describe('Nested Array Schema', () => {
    const userSchema = new Schema({
        name: {
            type: String,
            description: 'name',
            label: 'name',
            transformValue: (value) => capitalize(value),
            validators: ['required'],
        },
        cards: {
            type: ['CardArray'],
            description: 'card on user',
            label: 'card on user',
            validators: ['required']
        },
        description: {
            type: String,
        }
    }, {name: 'UserArray',})

    // @ts-ignore
    const cardSchema = new Schema({
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
            type: String,

            defaultValue: 'description'
        }
    }, {name: 'CardArray',})

    test('getPathDefinition', () => {
        let def = userSchema.getPathDefinition('name')
        expect(def.type).toBe(String)
        def = userSchema.getPathDefinition('cards')
        expect(def.type).toMatchObject(['CardArray'])

        def = userSchema.getPathDefinition('cards.number')
        expect(def.type).toBe(Number)

        def = userSchema.getPathDefinition('cards.$.number')
        expect(def.type).toBe(Number)

        def = userSchema.getPathDefinition('cards.$.description')
        expect(def.type).toBe(String)

        def = userSchema.getPathDefinition('cards.$')
        expect(def.type).toBe('CardArray')

        def = userSchema.getPathDefinition('cards.0')
        expect(def.type).toBe('CardArray')

        def = userSchema.getPathDefinition('cards')
        expect(def.type).toMatchObject(['CardArray'])


    })
    test("validate valid omit", () => {
        const errors = userSchema.validate({
            name: 'name 1',
            cards: [{number: 1}, {number: 2}, {number: 3}, {number: 4}]

        })
        expect(errors).toHaveLength(0)
    });

    test("validate invalid omit", () => {
        const errors = userSchema.validate({
            name: 'name 1',
            cards: [{number: 1}, {number: 2}, {}, {extraKey: 4}]

        })
        expect(errors).toHaveLength(3)
    });

    test("validate invalid is not array", () => {
        const errors = userSchema.validate({
            name: 'name 1',
            cards: {}

        })

        expect(errors).toHaveLength(1)
        expect(errors[0]).toHaveProperty('validatorName', 'isArray')
    });

    test("validate invalid null omit", () => {
        const errors = userSchema.validate({
            name: 'name 1',
            cards: [{number: 1}, {number: 2}, null, {extraKey: 4}]

        })
        expect(errors).toHaveLength(3)
    });


    test("clean", () => {
        let model = {}
        userSchema.clean(model)
        expect(model).toMatchObject({
            name: null,
            cards: []
        })

        model = {name: 'xxxx'}
        userSchema.clean(model)
        expect(model).toMatchObject({
            name: 'xxxx',
            cards: []
        })

        model = {cards: [{}, {}]}
        userSchema.clean(model)
        expect(model).toMatchObject({
            cards: [{number: null, user: null}, {number: null, user: null}],
            name: null
        })


        model = {name: 0.00001, cards: [{number: '1234'}, {number: '123456.78'}]}
        userSchema.clean(model)
        expect(model).toMatchObject({
            cards: [{number: 1234, user: null}, {number: 123456.78, user: null}],
            name: '0.00001'
        })
    })
    test("transform", () => {
        let model = {name: 'cesar', cards: []}
        userSchema.clean(model, true)
        expect(model).toMatchObject({
            cards: [],
            name: 'Cesar'
        })
    });

})