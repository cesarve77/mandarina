import {capitalize, lowerize, pluralize, singularize} from "./utils";

describe('Table Utils', () => {
    test("capitalize ", () => {
        expect(capitalize('abcd')).toBe('Abcd')
        expect(capitalize('Abcd')).toBe('Abcd')
        expect(capitalize('aBcd')).toBe('ABcd')
        expect(capitalize(' bcd')).toBe('Bcd')
    })
    test("lowerize ", () => {
        expect(lowerize('abcd')).toBe('abcd')
        expect(lowerize('Abcd')).toBe('abcd')
        expect(lowerize('aBcd')).toBe('aBcd')
        expect(lowerize(' BCD')).toBe('bCD')
    })
      test("pluralize ", () => {
        expect(pluralize('father child')).toBe('fatherChildren')
        expect(pluralize('one')).toBe('ones')
        expect(pluralize('table')).toBe('tables')
    })
  test("singuralize ", () => {
        expect(singularize('fatherChildren')).toBe('fatherChild')
        expect(singularize('father children')).toBe('fatherChild')
        expect(singularize('ones')).toBe('one')
    })

})
