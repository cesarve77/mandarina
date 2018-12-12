import {get} from "./utils";

let time = new Date().getTime()

function bm(description = '') {
    description && console.log(description, new Date().getTime() - time)
    time = new Date().getTime()

}



describe('Util', () => {
    const obj = {
        a: {
            b: [
                {
                    c: {
                        d: [{e: 1}, {e: 2}, {e: 3}, {e: 4}, {e: 5}]
                    }
                },
                {
                    c: {
                        d: [{e: 6}, {e: 7}, {e: 8}, {e: 9}, {e: 10}]
                    }
                },
                {
                    c: {
                        d: [{e: 11}, {e: 12}, {e: 13}, {e: 14}, {e: 15}]
                    }
                },
                {
                    c: {
                        d: [{e: 16}, {e: 17}, {e: 18}, {e: 19}, {e: 20}]
                    }
                }
            ]
        }
    }
    test("getArrayValue ", () => {
        bm()
        const result = get(obj, 'a.b.c.d.e'.split('.'))
        bm('getArrayValue')
        expect(result).toMatchObject([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    });
    test("getArrayValue ", () => {

//        /const result=getArrayValue2(obj,'a.b.c.d.e',['a.b','a.b.c.d'])

        //      expect(result).toMatchObject([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])
    });


})