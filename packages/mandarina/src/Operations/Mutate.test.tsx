import {getSubSchemaMutations} from './Mutate'
import {User} from "../../../../__TEST__/app/lib/schemas/User";


describe('Mutate', () => {

    describe('getSubSchemaMutations', () => {

        test("1 to n table create -> create ", () => {
            const subMutations = getSubSchemaMutations({
                age: 18,
                posts: [{title: 'Post 1', published: true, tags: ['tag1', 'tag2']}]
                // @ts-ignore
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
                // @ts-ignore
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
                // @ts-ignore
            }, User, 'update')
            expect(subMutations).toEqual({
                    "age": 18,
                    "categories": {"connect": [{"id": "cat1"}, {"id": "cat2"}]},
                }
            )
        })

        test("1 to n table update -> update ", () => {
            const subMutations = getSubSchemaMutations({
                age: 18,
                posts: [{id: "post1", title: 'Post 1', published: true, tags: ['tag1', 'tag2']}]
                // @ts-ignore
            }, User, 'update')
            expect(subMutations).toEqual({
                    "age": 18,
                    "posts": {
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
                // @ts-ignore
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
                // @ts-ignore
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
                // @ts-ignore
            }, User, 'update')
            console.dir('blueCard', subMutations.blueCard.upsert)
            expect(subMutations).toEqual({
                    "blueCard": {
                        "update": {id: "bc1", "number": "BC 1", "status": "A"}
                    }
                }
            )
        })

        test("1 - 1 table update -> update without id", () => {
            const subMutations = getSubSchemaMutations({
                blueCard: {number: "BC 1", status: "A"}
                // @ts-ignore
            }, User, 'update')
            console.dir('blueCard', subMutations.blueCard.upsert)
            expect(subMutations).toEqual({
                    "blueCard": {
                        "upsert": {"create": {"number": "BC 1", "status": "A"}, "update": {"number": "BC 1", "status": "A"}}
                    }
                }
            )
        })

        test("1 to 1 embebed  -> create ", () => {
            const subMutations = getSubSchemaMutations({
                address: {
                    country: 'Australia',
                    city: 'Gold Coast'
                },
            }, User, 'create')
            expect(subMutations).toEqual({
                    "address": {
                        "create": {"country": "Australia", "city": "Gold Coast"}
                    }
                }
            )
        })


        test("1 to 1 embebed  -> update ", () => {
            const subMutations = getSubSchemaMutations({
                address: {
                    country: 'Australia',
                    city: 'Gold Coast'
                },
            }, User, 'update')
            expect(subMutations).toEqual({
                    "address": {
                        "update": {"country": "Australia", "city": "Gold Coast"}
                    },
                }
            )
        })

        test("1 to n embebed  -> create ", () => {
            const subMutations = getSubSchemaMutations({
                cars: [{brand: 'Ford', plate: 'xxx000'}, {brand: 'Ford', plate: 'yyy111'}],
            }, User, 'create')
            expect(subMutations).toEqual({
                    "cars": {
                        "create": [{"brand": 'Ford', "plate": 'xxx000'}, {"brand": 'Ford', "plate": 'yyy111'}]
                    }
                }
            )
        })

        test("1 to n embebed  -> create empty", () => {
            const subMutations = getSubSchemaMutations({
                cars: [],
            }, User, 'create')
            expect(subMutations).toEqual({
                    "cars": {
                        "create": []
                    }
                }
            )
        })


        test("1 to n embebed  -> update ", () => {
            const subMutations = getSubSchemaMutations({
                cars: [{brand: 'Ford', plate: 'xxx000'}, {brand: 'Ford', plate: 'yyy111'}],
            }, User, 'update')
            console.log('subMutations', subMutations)
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
