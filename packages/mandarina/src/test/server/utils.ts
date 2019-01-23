import {client} from "./client";
import gql from "graphql-tag";
import {CategoryInterface} from "../tables/Category";
import {PostInterface} from "../tables/Post";
import {AddressInterface} from "../tables/Address";
import {buildQueryFromFields} from "../../Operations/utils";
import {Table} from "../../Table/Table";
import {ApolloQueryResult} from "apollo-client";


const random = (min = 1, max = 5) => Math.floor(Math.random() * max) + min


const categories: CategoryInterface[] = new Array(20).fill('').map((n, i) => ({category: `cat_${i}`}))
const tags: string[] = new Array(20).fill('').map((n, i) => (`tag_${i}`))
const categoriesCount = categories.length
const tagsCount = tags.length

export const categoriesCreator = (userId?: string): CategoryInterface[] => {
    const max = random()
    const result = [];
    for (let n = 1; n <= max; ++n) {
        const i = random(0, categoriesCount - 1)
        // @ts-ignore
        userId && categories[i].users.push(userId)
        result.push(categories[i]);
        categories[i] = categories[categoriesCount - n];
    }
    return result

}

export const idsSelector = (array: {id:string}[]): {id:string}[] => {
    const len=array.length
    const max = random(1,len-1)
    const result = [];
    for (let n = 1; n <= max; ++n) {
        const i = random(0, len - 1)
        result.push(array[i]);
        array[i] = array[len - n];
    }
    return result

}


export const tagsCreator = (): string[] => {
    const max = random()
    const result = [];
    for (let n = 1; n <= max; ++n) {
        const i = random(0, tagsCount - 1)
        result.push(tags[i]);
        tags[i] = tags[tagsCount - n];
    }
    return result

}


export const addressCreator = (userId?: string): AddressInterface => {
    const r= random(1000,9999)
    const result: AddressInterface={
        city: `city_${r}`,
        country: `country_${r}`,
    }
    if (userId) result.user=userId
    return result
}


export const postCreator = (userId?: string): PostInterface => {
    const r= random(1000,9999)
    const result: PostInterface={
        title: `post_${r}`,
        published: !!(r % 2),
        user: userId,
        tags: tagsCreator()
    }
    if (userId) result.user=userId
    return result
}

export const userCreator = (categoriesIds?:{id:string}[]): UserInterface => {
    const r= random(1000,9999)
    return ({
        age: random(18,60),
        email: `test_${r}_@gmail.com`,
        name: `test_${r}`,
        address: addressCreator(),
        categories: !categoriesIds ? categoriesCreator(): idsSelector(categoriesIds),
        posts: [postCreator(), postCreator()],
    })
}


export const findOne = async (table: Table, id:string):Promise<any> => {
    const queryName = table.names.query.single
    const query = buildQueryFromFields(table.getFields())
    const {data} = await client.query({
        query: gql`
            query doc{
                ${queryName}(where: {id: "${id}" })
                ${query}
            }
        `
    })
    return data[queryName]
}

export const findAll = async (table: Table):Promise<any> => {
    const queryName = table.names.query.plural
    const query = buildQueryFromFields(table.getFields())
    const {data} = await client.query({
        query: gql`
            query doc{
                ${queryName}
                ${query}
            }
        `
    })
    return data[queryName]
}


export const count = async (table: Table):Promise<number> => {
    const queryName = table.names.query.connection
    const {data}:ApolloQueryResult<any> = await client.query({
        query: gql`
            query count{
                ${queryName}{
                    aggregate{
                        count
                    }
                }
            }

        `
    })
    return data[queryName].aggregate.count
}


export const deleteMany = async (table:Table,where = '{}') => (
    await client.mutate({
        mutation: gql`
            mutation deleteManyDocs{
                ${ table.names.mutation.deleteMany}(where:${where}){
                count
            }}
        `
    })
)


