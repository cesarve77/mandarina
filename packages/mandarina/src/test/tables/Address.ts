import {Table} from '../../Table/Table'
import {ID, UserInterface} from "./User";


export const Address = new Table({
    country: {type: String},
    city: {type: String},
    user: {type: 'User'},
}, {
    name: 'Address',
})

export interface AddressInterface {
    country: string
    city: string
    user?: UserInterface | ID
}



