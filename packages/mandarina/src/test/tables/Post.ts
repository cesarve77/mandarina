import {Table} from '../../Table/Table'
import {ID, UserInterface} from "./User";



export const Post = new Table({
    title: {type: String},
    published: {type: Boolean},
    tags: {type: [String]},
    user: {type: 'User'},
}, {
    name: 'Post',
})

export interface PostInterface {
    title: string,
    published: boolean
    tags: string[]
    user?: UserInterface | ID
}