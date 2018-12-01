
import {addToSet} from "./Auth";


describe('Auth', () => {
    test("addToSet",  () => {
        const array1=[1,2,3,4]
        addToSet(array1,[1,2,3,4,5])
        expect(array1).toMatchObject([1,2,3,4,5])
        addToSet(array1,[1,2,6,3,4,5])
        expect(array1).toMatchObject([1,2,3,4,5,6])
        addToSet(array1,[5,2,3,4,1,6,7,7,7,8])
        expect(array1).toMatchObject([1,2,3,4,5,6,7,8])

    })
})