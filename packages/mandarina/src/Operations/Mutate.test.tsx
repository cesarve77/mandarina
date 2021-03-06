import {deepClone, getSubSchemaMutations} from './Mutate'
import {User} from "../../../../__TEST__/app/lib/schemas/User";


describe('Mutate', () => {
    describe('deepClone', () => {
        test("deepClone functionz ", () => {
            const obj = {a: 1, b: 2, f: (x) => x * 2}
            const clone=deepClone(obj)
            const rest=clone.f(4)
            expect(rest).toBe(8)
        })

    })

    describe('getSubSchemaMutations', () => {
        test("1 to n table create -> create ", () => {
            const subMutations = getSubSchemaMutations({
                age: 18,
                posts: [{title: 'Post 1', published: true, tags: ['tag1', 'tag2']}]
            }, User, 'create')
            expect(subMutations).toMatchObject({
                    "age": 18,
                    "posts": {"create": [{"title": "Post 1", "published": true, "tags": {"set": ["tag1", "tag2"]}}]}
                }
            )
        })

        test("1 to n table connect -> create ", () => {
            const subMutations = getSubSchemaMutations({
                age: 18,
                categories: [{id: "cat1"}, {id: "cat2"}],
            }, User, 'create')
            expect(subMutations).toEqual({
                    "age": 18,
                    "categories": {"connect": [{"id": "cat1"}, {"id": "cat2"}]},
                }
            )
        })

        test("1 to n table connect -> update ", () => {
            const subMutations = getSubSchemaMutations({
                age: 18,
                categories: [{id: "cat1"}, {id: "cat2"}],
            }, User, 'update')
            expect(subMutations).toEqual({
                    "age": 18,
                    "categories": {
                        "set": [{"id": "cat1",}, {"id": "cat2",}],
                        "connect": [{"id": "cat1"}, {"id": "cat2"}]
                    },

                }
            )
        })

        test("1 to n table update -> empty array ", () => {
            const subMutations = getSubSchemaMutations({
                age: 18,
                posts: []
            }, User, 'update')
            expect(subMutations).toEqual({
                    "age": 18,
                    "posts": {
                        "set": [],
                    }
                }
            )
        })


        test("1 to n table update -> update ", () => {
            const subMutations = getSubSchemaMutations({
                age: 18,
                posts: [{id: "post1", title: 'Post 1', published: true, tags: ['tag1', 'tag2']}]
            }, User, 'update')
            expect(subMutations).toEqual({
                    "age": 18,
                    "posts": {
                        "set": [{"id": "post1",}],
                        "update": [{
                            "where": {"id": "post1"},
                            "data": {
                                "published": true,
                                "tags": {"set": ["tag1", "tag2"]},
                                "title": "Post 1"
                            }
                        }]
                    }
                }
            )
        })


        test("1 - 1 table create -> create ", () => {
            const subMutations = getSubSchemaMutations({
                blueCard: {number: "BC 1", status: "A"}
            }, User, 'create')
            expect(subMutations).toEqual({
                    "blueCard": {
                        "create": {"number": "BC 1", "status": "A"}
                    }
                }
            )
        })

        test("1 - 1 table connect -> create ", () => {
            const subMutations = getSubSchemaMutations({
                blueCard: {id: "bc1"}
            }, User, 'create')
            expect(subMutations).toEqual({
                    "blueCard": {
                        "connect": {"id": "bc1"}
                    }
                }
            )
        })


        test("1 - 1 table update -> update with id", () => {
            const subMutations = getSubSchemaMutations({
                blueCard: {id: "bc1", number: "BC 1", status: "A"}
            }, User, 'update')
            console.dir('blueCard', subMutations.blueCard.upsert)
            expect(subMutations).toEqual({
                    "blueCard": {
                        "update": {"number": "BC 1", "status": "A"}
                    }
                }
            )
        })

        test("1 - 1 table update -> update without id", () => {
            const subMutations = getSubSchemaMutations({
                blueCard: {number: "BC 1", status: "A"}
            }, User, 'update')
            console.dir('blueCard', subMutations.blueCard.upsert)
            expect(subMutations).toEqual({
                    "blueCard": {
                        "upsert": {"create": {"number": "BC 1", "status": "A"}, "update": {"number": "BC 1", "status": "A"}}
                    }
                }
            )
        })

        // test("1 to 1 embebed  -> create ", () => {
        //     const subMutations = getSubSchemaMutations({
        //         address: {
        //             country: 'Australia',
        //             city: 'Gold Coast'
        //         },
        //     }, User, 'create')
        //     expect(subMutations).toEqual({
        //             "address": {
        //                 "create": {"country": "Australia", "city": "Gold Coast"}
        //             }
        //         }
        //     )
        // })
        //
        //
        // test("1 to 1 embebed  -> update ", () => {
        //     const subMutations = getSubSchemaMutations({
        //         address: {
        //             country: 'Australia',
        //             city: 'Gold Coast'
        //         },
        //     }, User, 'update')
        //     expect(subMutations).toEqual({
        //             "address": {
        //                 "update": {"country": "Australia", "city": "Gold Coast"}
        //             },
        //         }
        //     )
        // })
        //
        //
        // test("1 to n embebed  -> create ", () => {
        //     const subMutations = getSubSchemaMutations({
        //         cars: [{brand: 'Ford', plate: 'xxx000'}, {brand: 'Ford', plate: 'yyy111'}],
        //     }, User, 'create')
        //     expect(subMutations).toEqual({
        //             "cars": {
        //                 "create": [{"brand": 'Ford', "plate": 'xxx000'}, {"brand": 'Ford', "plate": 'yyy111'}]
        //             }
        //         }
        //     )
        // })
        //
        // test("1 to n embebed  -> create empty", () => {
        //     const subMutations = getSubSchemaMutations({
        //         cars: [],
        //     }, User, 'create')
        //     expect(subMutations).toEqual({
        //             "cars": {
        //                 "create": []
        //             }
        //         }
        //     )
        // })
        //
        //
        test("1 to n embebed  -> update ", () => {
            const subMutations = getSubSchemaMutations({
                cars: [{brand: 'Ford', plate: 'xxx000'}, {brand: 'Ford', plate: 'yyy111'}],
            }, User, 'update')
            expect(subMutations).toEqual({
                    "cars": {
                        "deleteMany": [{}],
                        "create": [{"brand": 'Ford', "plate": 'xxx000'}, {"brand": 'Ford', "plate": 'yyy111'}]
                    }
                }
            )
        })


    })
})
