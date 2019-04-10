import 'jsdom-global/register'
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from "react";
import {Category} from '../../schemas/Category'
import {count, deleteMany, findAll, findOne, userCreator} from "../../server/utils";
import App from "../../server/client";
import {Create, Update} from "../../../Operations/Mutate";
import {User} from "../../schemas/User";
import {Post} from "../../schemas/Post";

Enzyme.configure({adapter: new Adapter()});

describe('Mutate', async () => {

    test("create category ", async (done) => {
        await deleteMany(Category)
        const mockFn = jest.fn();
        mockFn.mockImplementation(({called, mutate}) => {
            if (!called) {
                const total = 5
                let execute = 0
                for (let cat = 0; cat < total; cat++) {
                    const model = {category: `cat_${cat}`}
                    mutate(model)
                        .then(async ({data}: any) => {
                            const id = data.createCategory.id
                            const category = await findOne(Category, id)
                            expect(category.id).toBe(id);
                            execute++
                            if (execute >= total) done()
                        })
                        .catch(console.error)

                }
            }
            return null
        })
        mount(
            <App>
                <Create table={Category}>
                    {mockFn}
                </Create>
            </App>
        );
    })

    test("create user with posts and new categories ", async (done) => {
        const mockFn = jest.fn();
        mockFn.mockImplementation(({called, mutate}) => {
            if (!called) {
                const model = userCreator()
                mutate(model)
                    .then(async ({data}: any) => {
                        const id = data.createUser.id
                        const user = await findOne(User,id)
                        expect(user.id).toBe(id);
                        done()
                    })
                    .catch(console.error)

            }
            return null

        })
        mount(<App>
                <Create table={User}>
                    {mockFn}
                </Create>
            </App>
        );
    })


    test("create user with posts and exist categories ", async (done) => {
        const categories = await findAll(Category)
        const categoryIds = categories.map((o: { id: string }) =>( {id: o.id}))
        const mockFn = jest.fn();
        mockFn.mockImplementation(({called, mutate}) => {
            if (!called) {
                const model = userCreator(categoryIds)
                mutate(model)
                    .then(async ({data}: any) => {
                        const id = data.createUser.id
                        const user = await findOne(User, id)
                        expect(user.id).toBe(id);
                        const categoriesCount = await count(Category)
                        expect(categoriesCount).toBe(categoryIds.length)
                        done()
                    })
                    .catch(console.error)

            }
            return null

        })
        mount(<App>
                <Create table={User}>
                    {mockFn}
                </Create>
            </App>
        );
    })

    test("update user with posts and exist categories ", async (done) => {
        const categories = await findAll(Category)
        const categoryIds = categories.map((o: { id: string }) =>( {id: o.id}))
        const mockFn = jest.fn();
        const users = await findAll(User)
        const user =users[0]
        mockFn.mockImplementation(({called, mutate}) => {
            if (!called) {
                const model = userCreator(categoryIds)
                mutate(model)
                    .then(async ({data}: any) => {
                        const id = data.updateUser.id
                        const user = await findOne(User, id)
                        expect(user.address.city).toBe(model.address.city);
                        expect(user.address.country).toBe(model.address.country);
                        expect(user.age).toBe(model.age);
                        expect(user.name).toBe(model.name);
                        expect(user.posts[user.posts.length-1].tags).toMatchObject(model.posts[model.posts.length-1].tags);
                        expect(user.email).toBe(model.email);
                        done()
                    })
                    .catch(console.error)

            }
            return null

        })



        mount(<App>
                <Update table={User} id={user.id}>
                    {mockFn}
                </Update>
            </App>
        );
    })
})