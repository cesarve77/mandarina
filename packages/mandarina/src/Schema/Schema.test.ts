import {Integer, Schema} from "./Schema";
// import {maxNumber} from "./Validators";
// import {isRequired} from "./utils";
import './Validators'
import {User} from "../../../../__TEST__/app/lib/schemas/User";


describe('Schema', () => {

    test("constructor ", () => {
        expect(User).toBeInstanceOf(Schema);
    });

    test("extend ", () => {
        User.extend({newField: {type: String}})
        expect(User.shape).toHaveProperty('newField');
    });

    test("getInstance ", () => {
        expect(Schema.getInstance('User')).toBe(User);
    });

    // test("applyDefinitionsDefaults ", () => {
    //     const def = schema.applyDefinitionsDefaults({
    //         type: String,
    //         description: 'name',
    //         validators: [{required: true}]
    //     }, 'name')
    //     expect(def).toHaveProperty('label', 'Name');
    //     expect(isRequired(def)).toBe(true)
    // });
    //
    // test("applyDefinitionsDefaults validator finder ", () => {
    //     const def = schema.applyDefinitionsDefaults({
    //         type: String,
    //         description: 'name',
    //         validators: [{minNumber: 5}, maxNumber.with(10), 'required']
    //     }, 'name')
    //     expect(def).toHaveProperty('label', 'Name');
    //     expect(isRequired(def)).toBe(true)
    //     expect(def.validators[0]).toHaveProperty('name', 'Validator')
    //     expect(def.validators[0]).toHaveProperty('name', 'Validator')
    //     expect(def.validators[1]).toHaveProperty('name', 'Validator')
    //     expect(def.validators[2]).toHaveProperty('name', 'Validator')
    // });
    //
    // test("applyDefinitionsDefaults label function", () => {
    //     const def = schema.applyDefinitionsDefaults({
    //         type: String,
    //         label: () => 'Label func',
    //         validators: ['required']
    //     }, 'name')
    //
    //     expect(def).toHaveProperty('label', 'Label func',);
    //     expect(isRequired(def)).toBe(true)
    // });

    test("family", () => {
        const FamilySchema = new Schema({
            parents: {type:['FamilyParent']}
        },{name: 'Family'})


        new Schema({
            firstName: {type: String, validators:['required']},
            user: {type: 'User2'},
        },{name: 'FamilyParent'})

        new Schema({
            contactPreferencesEmail: {type: Boolean},
            email: {type: String, validators:['required','isEmail']}

        },{name: 'User2'})

        const model={"parents": [{
                "firstName": "1111",
                "user": { "email": null,},
            }, {
                "firstName": "2222",
                "user": { "email": null,},
            }]
        }
        const errors=FamilySchema.validate(model,['parents.firstName','parents.user.email'])
        expect(errors).toHaveLength(2)
    })
    test("validate valid", () => {
        const errors = User.validate({
            name: 'test 1'
        })
        expect(errors).toHaveLength(0)
    });

    test("validate invalid extra key", () => {
        const errors = User.validate({
            name: 'name',
            extraKey: 'test 1'
        })
        expect(errors).toHaveLength(1)
        expect(errors[0]).toHaveProperty('validatorName', 'extraKey')
    });

    test("validate invalid ", () => {
        const errors = User.validate({
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
            },
        }

        const schema = new Schema(userShape, {name: 'Profile'})
        let errors = schema.validate({
            name: '123',
            height: '5',
            age: '15',
            bod: 'xxxxx',
        },[  'name',
            'height',
            'age',
            'bod',])
        expect(errors[0]).toHaveProperty('label', 'height');
        expect(errors[0]).toHaveProperty('validatorName', 'minNumber');
        expect(errors[1]).toHaveProperty('label', 'date');
        expect(errors[1]).toHaveProperty('validatorName', 'isDate');

        errors = schema.validate({
            name: undefined,
            height: 5,
            age: 15.5,
            bod: new Date(),
        },[  'name',
            'height',
            'age',
            'bod',])
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
            create: ['admin'],
            update: ['admin'],
            delete: ['admin']

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
        let errors = userSchema.validate({
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

        },['name','card.number'])
        expect(errors).toHaveLength(0)
         errors = userSchema.validate({
            name: 'name 1',
            card: {
                number: null,

            }

         },['name','card.number'])
        expect(errors).toHaveLength(1)
    });

    test("validate invalid omit", () => {
        const errors = userSchema.validate({
            name: 'name 1',
            card: {}

        },['name','card.number'])
        expect(errors).toHaveLength(1)
    });


})


describe('Nested Array Schema', () => {
    test('getPathDefinition', () => {
        let def = User.getPathDefinition('name')
        expect(def.type).toBe(String)
        def = User.getPathDefinition('age')
        expect(def.type).toBe(Integer)

        def = User.getPathDefinition('address')
        expect(def.type).toBe('Address')

        def = User.getPathDefinition('posts')
        expect(def.type).toBe('Post')

        def = User.getPathDefinition('posts.title')
        expect(def.type).toBe(String)

        def = User.getPathDefinition('posts.user')
        expect(def.type).toBe('User')

        def = User.getPathDefinition('posts.$.user')
        expect(def.type).toBe('User')

        def = User.getPathDefinition('posts.$.user.name')
        expect(def.type).toBe(String)


        def = User.getPathDefinition('posts.0.user')
        expect(def.type).toBe('User')

        def = User.getPathDefinition('posts.0.user.name')
        expect(def.type).toBe(String)

        def = User.getPathDefinition('posts.$')
        expect(def.type).toBe('Post')

        def = User.getPathDefinition('posts.0')
        expect(def.type).toBe('Post')

        def = User.getPathDefinition('blueCard')
        expect(def.type).toBe('BlueCard')


    })
    test("validate valid omit", () => {
        const errors = User.validate({
            name: 'name 1',
            cards: [{number: 1}, {number: 2}, {number: 3}, {number: 4}]

        })
        expect(errors).toHaveLength(0)
    });

    test("validate invalid omit", () => {
        const errors = User.validate({
            name: 'name 1',
            cards: [{number: 1}, {number: 2}, {}, {extraKey: 4}]

        })
        expect(errors).toHaveLength(3)
    });

    test("validate invalid is not array", () => {
        const errors = User.validate({
            name: 'name 1',
            cards: {}

        })

        expect(errors).toHaveLength(1)
        expect(errors[0]).toHaveProperty('validatorName', 'isArray')
    });

    test("validate invalid null omit", () => {
        const errors = User.validate({
            name: 'name 1',
            cards: [{number: 1}, {number: 2}, null, {extraKey: 4}]

        })
        expect(errors).toHaveLength(3)
    });


    test("clean", () => {
        let model = {}
        User.clean(model)
        expect(model).toMatchObject({
            id: null,
            age: null,
            email: null,
            name: null,
            address: {},
            categories: [],
            posts: [],
            blueCard: {},
            cars: []
        })

        model = {name: 'xxxx'}
        User.clean(model)
        expect(model).toMatchObject({
            id: null,
            age: null,
            email: null,
            name: 'xxxx',
            address: {},
            categories: [],
            posts: [],
            blueCard: {},
            cars: []
        })

        model = {posts: [{}, {}]}
        User.clean(model)
        expect(model).toMatchObject({
            posts: [
                {
                    id: null,
                    title: null,
                    published: null,
                    tags: null,
                },
                {
                    id: null,
                    title: null,
                    published: null,
                    tags: null,
                }],
            name: null,
            id: null,
            age: null,
            email: null,
            address: {},
            categories: [],
            blueCard: {},
            cars: [],
        })

        model = {name: 0.00001, posts: [{title: '1234'}, {title: '123456.78'}]}
        User.clean(model)
        expect(model).toMatchObject({
            posts: [
                {
                    id: null,
                    title: '1234',
                    published: null,
                    tags: null,
                },
                {
                    id: null,
                    title: '123456.78',
                    published: null,
                    tags: null,
                }],
            name: '0.00001',
            id: null,
            age: null,
            email: null,
            address: {},
            categories: [],
            blueCard: {},
            cars: [],
        })
    })
    test("transform", () => {
        let model = {name: 'cesar', cards: []}
        User.clean(model)
        expect(model).toMatchObject({
            cards: [],
            name: 'Cesar'
        })
    });

})