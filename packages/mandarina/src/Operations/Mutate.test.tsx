import {getSubSchemaMutations} from './Mutate'
import {User} from "../test/schemas/User";


describe('Mutate', () => {
    test("getSubSchemaMutations ", () => {
        const subMutations = getSubSchemaMutations({
            age: 18,
            address: {
                country: 'Australia',
                city: 'Gold Coast'
            },
            categories: [{category: 'New Cat'}, {category: 'Sec Cat'}],
            posts: [{title: 'Post 1', published: true, tags: ['tag1', 'tag2']}]
        }, User, 'create')
        console.log(JSON.stringify(subMutations))
        console.dir(subMutations, {depth: null, colors: true})
        expect(subMutations).toMatchObject({
                "age": 18,
                "address": {"create": {"country": "Australia", "city": "Gold Coast"}},
                "categories": {"create": [{"category": "New Cat"}, {"category": "Sec Cat"}]},
                "posts": {"create": [{"title": "Post 1", "published": true, "tags": {"set": ["tag1", "tag2"]}}]}
            }
        )
    })
    test("getSubSchemaMutations ", () => {
        const subMutations = getSubSchemaMutations({
            age: 18,
            address: {
                country: 'Australia',
                city: 'Gold Coast'
            },
            categories: [{id: "cat1"}, {id: "cat2"}],
            posts: [{title: 'Post 1', published: true, tags: ['tag1', 'tag2']}]
        }, User, 'update')
        console.log(JSON.stringify(subMutations))
        console.dir(subMutations, {depth: null, colors: true})
        expect(subMutations).toMatchObject({
                "age": 18,
                "address": {"create": {"country": "Australia", "city": "Gold Coast"}},
                "categories": {"connect": [{"id": "cat1"}, {"id": "cat2"}]},
                "posts": {"create": [{"title": "Post 1", "published": true, "tags": {"set": ["tag1", "tag2"]}}]}
            }
        )
    })
    test("getSubSchemaMutations ", () => {
        const subMutations = getSubSchemaMutations({
            age: 18,
            address: {
                country: 'Australia',
                city: 'Gold Coast'
            },
            categories: [{id: "cat1"}, {category: 'Sec Cat'}],
            posts: [{id: "post1", title: 'Post 1', published: true, tags: ['tag1', 'tag2']}]
        }, User, 'update')
        console.log(JSON.stringify(subMutations))
        console.dir(subMutations, {depth: null, colors: true})
        expect(subMutations).toMatchObject({
                "address": {"create": {"city": "Gold Coast", "country": "Australia"}},
                "age": 18,
                "categories": {"connect": [{"id": "cat1"}], "create": [{"category": "Sec Cat"}]},
                "posts": {
                    "update": [{
                        "id": "post1",
                        "published": true,
                        "tags": {"set": ["tag1", "tag2"]},
                        "title": "Post 1"
                    }]
                }
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