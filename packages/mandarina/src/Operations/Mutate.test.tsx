import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from "react";

import {Category} from '../test/tables/Category'
import {deleteMany, findOne} from "../test/server/utils";
import App from "../test/server/client";
import {Create} from "./Mutate";

Enzyme.configure({adapter: new Adapter()});

describe('Mutate', () => {

    const categoryIds: string[] = []
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
                            categoryIds.push(id)
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

})