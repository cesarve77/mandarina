import {Table} from '../../../../mandarina-server/src/Table/Table'
import {Integer} from "../../Schema/Schema";
import {CategoryInterface} from "./Category";
import {PostInterface} from "./Post";
import {AddressInterface} from "./Address";


export const User = new Table({
    age: {type: Integer, optional: true,},
    email: {type: String},
    name: {type: String},
    address: {type: 'Address'},
    categories: {type: ['Category']},
    posts: {type: ['Post']},
}, {
    name: 'User',
})

export type ID = string


export interface UserInterface {
    age: number
    email: string
    name: string
    address: AddressInterface
    categories: CategoryInterface[] | {id:string}[]
    posts: PostInterface[]
}






