
import {Schema} from 'mandarina'
import {Bridge} from './Bridge'

const userSchema = new Schema({
    name: {
        type: String,
        description: 'name',
        label: 'name',
        validators: ['required'],
    },
    cards: {
        type: ['CardArray'],
        description: 'card on user',
        label: 'card on user',
        validators: ['required']
    }
}, {name: 'UserArray',})

// @ts-ignore
const cardSchema = new Schema({
    number: {
        type: Number,
        description: 'number',
        label: 'number',
        validators: ['required',{'isAllowed':[0,1,2,3,4,5]}]
    }
}, {name: 'CardArray',})


const bridge = new Bridge(userSchema);

describe('Bridge', () => {
    test("compileMessage", () => {
        expect(true).toBe(true);
    });
/*
test("getError (name, error)", () => {
    console.log(simpleBridge.getError('name'));
    console.log(bridge.getError('name',{}));
    expect(true).toBe(true);
})

        // Field's scoped error message.
    test("getErrorMessage (name, error)", () => {

    }

        // All error messages from error.
    test("getErrorMessages (error)", () => {

    }
*/
        // Field's definition (`field` prop).
    test("getField (name)", () => {
        let mandarina=bridge.getField('name')
        expect(mandarina.type).toBe(mandarina.type)//todo
         mandarina=bridge.getField('cards')
        expect(mandarina.type).toBe(mandarina.type)//todo
        //expect(simple.label).toBe(mandarina.label)

        mandarina=bridge.getField('cards.$')
        expect(mandarina.type).toBe(mandarina.type)
        expect(mandarina.label).toBe(mandarina.label)

    })
    // Field's subfields (or first-level fields).
    test("getSubfields (name)", () => {
        let mandarina=bridge.getSubfields('name')
        expect(mandarina).toMatchObject(mandarina)
        mandarina=bridge.getSubfields('cards')
        expect(mandarina).toMatchObject(mandarina)
        mandarina=bridge.getSubfields('cards.$')
        expect(mandarina).toMatchObject(mandarina)
    })
    test("findValidator",()=>{
        const required =  !!bridge.findValidator('required','name')
        expect(required).toBe(true)
        const isAllowed = <any>bridge.findValidator('isAllowed','cards.number')
        expect(isAllowed.param).toMatchObject([0,1,2,3,4,5])
    })

    test("getProps (name)", () => {
        let mandarina=bridge.getProps('name')
        expect(mandarina).toMatchObject(mandarina)
        mandarina=bridge.getProps('cards')
        expect(mandarina).toMatchObject(mandarina)
        mandarina=bridge.getProps('cards.$')
        expect(mandarina).toMatchObject(mandarina)
    })
        // Field's initial value.
    test("getInitialValue (name)", () => {

    })
    /*
            // Field's props.
        test("getProps (name)", () => {

        }


            // Field's type (ex. Number, String).
        test("getType (name)", () => {

        }
            // Function with one argument - model - which throws errors when model is
            // invalid.
        test("getValidator (options)", () => {

        }*/
});