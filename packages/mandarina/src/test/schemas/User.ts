import {Integer, Schema} from "../..";
import "./Post";
import "./Address";
import "./Category";


export const User = new Schema({
    id: {type: String},
    age: {type: Integer,},
    email: {type: String},
    name: {type: String},
    address: {type: 'Address'},
    categories: {type: ['Category']},
    posts: {type: ['Post']},
}, {
    name: 'User',
})




