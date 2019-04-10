import {Schema} from "../..";


export const Address = new Schema({
    country: {type: String},
    city: {type: String},
    user: {type: 'User'},
}, {
    name: 'Address',
})

