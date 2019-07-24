import {compileMessage, ValidatorParams} from "./ValidatorCreator";
import {
    extraKey,
    isAllowed,
    isArray,
    isDate,
    isInteger,
    isNumber,
    isString,
    maxCount,
    maxDate,
    maxNumber,
    maxNumberExclusive,
    maxString,
    minCount,
    minDate,
    minNumber,
    minNumberExclusive,
    minString,
    required
} from "./Validators";
import {Integer} from "./Schema";

let paramCounter = 0
const getParams = (value: any, type: any): ValidatorParams => {


    paramCounter++
    return {
        key: `key${paramCounter}`,
        path: '',
        definition: {
            label: `Key ${paramCounter}`,
            type,
            validators: [],
            defaultValue: null,
            transformValue: (val) => val,
        },
        value
    }
}

describe('Validators', () => {

    test("compileMessage", () => {
        let message = compileMessage({label: 'test1', template: '{{label}} xxx'})
        expect(message).toBe('test1 xxx')

        message = compileMessage({label: 'test2', template: 'xxx {{label}} xxx'})
        expect(message).toBe('xxx test2 xxx')

        message = compileMessage({label: 'test3', template: '{{label}} xxx {{param}}', param: 100})
        expect(message).toBe('test3 xxx 100')

        message = compileMessage({
            label: 'test4',
            template: '{{label}} xxx {{param}}',
            param: 'yyy'
        })
        expect(message).toBe('test4 xxx yyy')
    })


    test("required", () => {
        const Validator = required.getValidatorWithParam(true)

        let validator = new Validator(getParams(0, Number))
        let error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(undefined, Number))
        error = validator.validate()
        console.log('error', error)
        expect(error).toHaveProperty('validatorName', 'required');

        validator = new Validator(getParams(undefined, String))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'required');

        validator = new Validator(getParams(undefined, Date))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'required');


    });


    test("minNumberExclusive", () => {
        const Validator = minNumberExclusive.getValidatorWithParam(5)

        let validator = new Validator(getParams(10, Number))
        let error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(5, Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'minNumberExclusive');

        validator = new Validator(getParams(5, Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'minNumberExclusive');

    });

    test("minNumber", () => {
        const Validator = minNumber.getValidatorWithParam(5)

        let validator = new Validator(getParams(10, Number))
        let error = validator.validate()
        expect(error).toBeUndefined()
         validator = new Validator(getParams(undefined, Number))
         error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'minNumber');

        validator = new Validator(getParams(5, Number))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(1, Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'minNumber');
    });


    test("maxNumberExclusive", () => {
        const Validator = maxNumberExclusive.getValidatorWithParam(5)

        let validator = new Validator(getParams(1, Number))
        let error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(5, Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'maxNumberExclusive');

        validator = new Validator(getParams(10, Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'maxNumberExclusive');
    });


    test("maxNumber", () => {
        const Validator = maxNumber.getValidatorWithParam(5)

        let validator = new Validator(getParams(1, String))
        let error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(5, String))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(10, String))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'maxNumber');
    });


    test("minString", () => {
        const Validator = minString.getValidatorWithParam(5)

        let validator = new Validator(getParams('one', String))
        let error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'minString');

        validator = new Validator(getParams('seven', String))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams('eleven', String))
        error = validator.validate()
        expect(error).toBeUndefined()


    });


    test("maxString", () => {
        const Validator = maxString.getValidatorWithParam(5)

        let validator = new Validator(getParams('one', Number))
        let error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams('seven', Number))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams('eleven', Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'maxString');
    });


    test("minDate", () => {
        const date = new Date(2000, 6, 6)
        const after = new Date(2000, 6, 5)
        const before = new Date(2000, 6, 7)
        const Validator = minDate.getValidatorWithParam(date)

        let validator = new Validator(getParams(after, Number))
        let error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(date, Number))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(before, Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'minDate');
    });


    test("maxDate", () => {
        const date = new Date(2000, 6, 6)
        const after = new Date(2000, 6, 5)
        const before = new Date(2000, 6, 7)
        const Validator = maxDate.getValidatorWithParam(date)

        let validator = new Validator(getParams(before, Number))
        let error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(date, Number))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(after, Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'maxDate');
    });

    test("minCount", () => {
        const Validator = minCount.getValidatorWithParam(5)

        let validator = new Validator(getParams([0, 1, 2, 3, 4], [Number]))
        let error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams([0, 1, 2, 3, 4, 5], [Number]))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams([0, 1, 2, 3], [Number]))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'minCount');
    });


    test("maxCount", () => {
        const Validator = maxCount.getValidatorWithParam(5)

        let validator = new Validator(getParams([0, 1, 2, 3, 4], [Number]))
        let error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams([0, 1, 2, 3], [Number]))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams([0, 1, 2, 3, 4, 5], [Number]))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'maxCount');
    });


    test("extraKey", () => {
        const Validator = extraKey.getValidatorWithParam() //it always send error
        let validator = new Validator(getParams({}, Number))
        let error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'extraKey');
    });


    test("isArray", () => {
        const Validator = isArray.getValidatorWithParam() //it always send error
        let validator = new Validator(getParams({}, [Number]))
        let error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isArray');

        validator = new Validator(getParams(undefined, [Number]))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isArray');

        validator = new Validator(getParams(1, [Number]))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isArray');

        validator = new Validator(getParams('1', [Number]))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isArray');

        validator = new Validator(getParams([], [Number]))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams([0, 1, 2, 3], [Number]))
        error = validator.validate()
        expect(error).toBeUndefined()

    });


    test("isDate", () => {
        const Validator = isDate.getValidatorWithParam() //it always send error
        let validator = new Validator(getParams({}, Date))
        let error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isDate');

        validator = new Validator(getParams(undefined, Date))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(1, Date))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isDate');

        validator = new Validator(getParams('1', Date))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isDate');

        validator = new Validator(getParams([], Date))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isDate');

        validator = new Validator(getParams(new Date(), Date))
        error = validator.validate()
        expect(error).toBeUndefined()

    });

    test("isNumber", () => {
        const Validator = isNumber.getValidatorWithParam() //it always send error
        let validator = new Validator(getParams({}, Number))
        let error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isNumber');

        validator = new Validator(getParams(undefined, Number))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams('1', Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isNumber');

        validator = new Validator(getParams([], Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isNumber');

        validator = new Validator(getParams(new Date(), Number))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isNumber');

        validator = new Validator(getParams(0, Number))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(.5, Number))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(1, Number))
        error = validator.validate()
        expect(error).toBeUndefined()

    });

    test("isString", () => {
        const Validator = isString.getValidatorWithParam() //it always send error
        let validator = new Validator(getParams({}, String))
        let error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isString');

        validator = new Validator(getParams(undefined, String))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(1, String))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isString');

        validator = new Validator(getParams([], String))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isString');

        validator = new Validator(getParams(new Date(), String))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isString');

        validator = new Validator(getParams('', String))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams('0', String))
        error = validator.validate()
        expect(error).toBeUndefined()

    });

    test("isInteger", () => {
        const Validator = isInteger.getValidatorWithParam() //it always send error
        let validator = new Validator(getParams({}, Integer))
        let error = validator.validate()


        validator = new Validator(getParams(.5, Integer))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isInteger');


        validator = new Validator(getParams(0, Integer))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams(1, Integer))
        error = validator.validate()
        expect(error).toBeUndefined()

    });


    test("isAllowed", () => {
        const Validator = isAllowed.getValidatorWithParam(['a', 'b', 'c', 'd']) //it always send error
        let validator = new Validator(getParams('a', String))
        let error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams('d', String))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams('c', String))
        error = validator.validate()
        expect(error).toBeUndefined()

        validator = new Validator(getParams('x', String))
        error = validator.validate()
        expect(error).toHaveProperty('validatorName', 'isAllowed');


    });


})
