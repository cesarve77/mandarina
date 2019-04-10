import {Schema} from "../..";


export const Category = new Schema({
    id: {type: String},
    category: {type: String},
    'users': {type: ['User']},
}, {
    name: 'Category',
})


