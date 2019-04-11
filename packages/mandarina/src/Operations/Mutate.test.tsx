import {getSubSchemaMutations} from './Mutate'
import {User} from "../../../../__TEST__/app/lib/schemas/User";


describe('getSubSchemaMutations', () => {

    test("1 to n table -> create ", () => {
        const subMutations = getSubSchemaMutations({
            age: 18,
            address: {
                country: 'Australia',
                city: 'Gold Coast'
            },
            categories: [{category: 'New Cat'}, {category: 'Sec Cat'}],
            posts: [{title: 'Post 1', published: true, tags: ['tag1', 'tag2']}]
            // @ts-ignore
        }, User, 'create')
        expect(subMutations).toMatchObject({
                "age": 18,
                "address": {"create": {"country": "Australia", "city": "Gold Coast"}},
                "categories": {"create": [{"category": "New Cat"}, {"category": "Sec Cat"}]},
                "posts": {"create": [{"title": "Post 1", "published": true, "tags": {"set": ["tag1", "tag2"]}}]}
            }
        )
    })


    test("1 to n table -> connect ", () => {
        const subMutations = getSubSchemaMutations({
            age: 18,
            address: {
                country: 'Venezuela',
                city: 'Caracas'
            },
            categories: [{id: "cat1"}, {id: "cat2"}],
            posts: [{title: 'Post 1', published: true, tags: ['tag1', 'tag2']}]
            // @ts-ignore
        }, User, 'update')
        expect(subMutations).toMatchObject({
                "age": 18,
                "address": {"upsert": {"create": {"city": "Caracas", "country": "Venezuela"}, "update": {"city": "Caracas", "country": "Venezuela"}}},
                "categories": {"connect": [{"id": "cat1"}, {"id": "cat2"}]},
                "posts": {"create": [{"title": "Post 1", "published": true, "tags": {"set": ["tag1", "tag2"]}}]}
            }
        )
    })
    test("1 - to n table -> update ", () => {
        const subMutations = getSubSchemaMutations({
            age: 18,
            categories: [{id: "cat1"}, {category: 'Sec Cat'}],
            posts: [{id: "post1", title: 'Post 1', published: true, tags: ['tag1', 'tag2']}]
            // @ts-ignore
        }, User, 'update')
        expect(subMutations).toMatchObject({
                "age": 18,
                "categories": {"connect": [{"id": "cat1"}], "create": [{"category": "Sec Cat"}]},
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

    test("1 - to n embebed -> create ", () => {
        const subMutations = getSubSchemaMutations({
            cars: [{plate: "xxx000", brand: 'Ford'}, {number: 'yyy111', status: 'Ford'}]
            // @ts-ignore
        }, User, 'create')
        expect(subMutations).toMatchObject({
                "cars": {
                    "create": [{"data": {"plate": "xxx000", "brand": 'Ford'}}, {"data": {"number": 'yyy111', "status": 'Ford'}}]
                }
            }
        )
    })


    test("1 - to n embebed -> update ", () => {
        const subMutations = getSubSchemaMutations({
            cars: [{plate: 'xxx000', brand: 'Ford'}, {plate: 'BC 2', brand: 'Ford'}]
            // @ts-ignore
        }, User, 'update')
        expect(subMutations).toMatchObject({
                "blueCards": {
                    "deleteMany": [{}],
                    "create": [{"data": {"plate": 'xxx000', "brand": 'Ford'}}, {"data": {"plate": 'yyy111', "brand": 'Ford'}}]
                }
            }
        )
    })
    test("1 to 1 embebed -> update ", () => {
        const subMutations = getSubSchemaMutations({
            address: {
                country: 'Australia',
                city: 'Gold Coast'
            },
        }, User, 'update')
        expect(subMutations).toMatchObject({
                "address": {
                    "upsert": {
                        "create": {"country": "Australia", "city": "Gold Coast"},
                        "update": {"country": "Australia", "city": "Gold Coast"}
                    }
                },
            }
        )
    })


})


// import Enzyme, {mount} from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';
// import React from "react";
//
// import {Category} from '../test/tables/Category'
// import {deleteMany, findOne} from "../test/server/utils";
// import App from "../test/server/client";
// import {Create} from "./Mutate";

// Enzyme.configure({adapter: new Adapter()});


//     const categoryIds: string[] = []
//     test("create category ", async (done) => {
//         await deleteMany(Category)
//         const mockFn = jest.fn();
//         mockFn.mockImplementation(({called, mutate}) => {
//             if (!called) {
//                 const total = 5
//                 let execute = 0
//                 for (let cat = 0; cat < total; cat++) {
//                     const model = {category: `cat_${cat}`}
//                     mutate(model)
//                         .then(async ({data}: any) => {
//                             const id = data.createCategory.id
//                             const category = await findOne(Category, id)
//                             expect(category.id).toBe(id);
//                             categoryIds.push(id)
//                             execute++
//                             if (execute >= total) done()
//                         })
//                         .catch(console.error)
//
//                 }
//             }
//             return null
//         })
//         mount(
//             <App>
//                 <Create schema={Category}>
//                     {mockFn}
//                 </Create>
//             </App>
//         );
//     })
//
// })