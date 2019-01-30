import {Table} from '../../../../mandarina-server/src/Table/Table'
import {ID, UserInterface} from "./User";


export const Category = new Table({
    category: {type: String},
    'users': {type: ['User']},
}, {
    name: 'Category',
})


export interface CategoryInterface {
    category: string
    users?: UserInterface[] | ID[]
}