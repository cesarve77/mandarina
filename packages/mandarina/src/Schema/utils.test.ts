import {get} from "./utils";




describe('Util', () => {
    test("get with array values", () => {
        const obj = {
            name: 'name',
            tags: [
                {name: 'tag1'},
                {name: 'tag2'}
            ],
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
        let result
        // let result = get(obj, 'a.b.c.d.e'.split('.'))
        // bm('getArrayValue')
        // expect(result).toMatchObject([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
        result = get(obj, 'tags.name'.split('.'))
        expect(result).toMatchObject(['tag1','tag2'])

    });

    const data = {
        age: 15,
        firstName: null,
        gender: "Female",
        group: {
            city: "Gold Coast",
            coaches: true,
            code: "G1808",
            location: {
                address: {
                    lat: -27.7927741,
                    lng: 153.2678158,
                    zip: "4208",
                    unit: "62 Reedmans Rd, Ormeau QLD 4208, Australia",
                    city: "Gold Coast",
                },
                goals: null,
                location: '000000',
            }
        },
        parents:[{name:'cesar'}]
    }
    test("get array with the same property name ", () => {
        bm()
        const value = get(data, 'parents'.split('.'))
        expect(value).toMatchObject([{name:'cesar'}])
        bm('group.location.location')
    });

    test("get nested object with the same property name ", () => {
        bm()
        const value = get(data, 'group.location.location'.split('.'))
        expect(value).toMatchObject([data.group.location.location])
        bm('group.location.location')
    });
    test('get other cases', () => {
        bm()
        let value = get(data, 'group.location.address.lat'.split('.'))
        expect(value).toMatchObject([data.group.location.address.lat])
        value = get(data, 'group.location.address'.split('.'))
        expect(value).toMatchObject([data.group.location.address])

        value = get(data, 'group.location'.split('.'))
        expect(value).toMatchObject([data.group.location])
        bm('get other cases')
    })


})
