let Schema,Integer
// @ts-ignore
if (!global.describe){
    Schema=require("../../../../packages/mandarina/build").Schema
    Integer=require("../../../../packages/mandarina/build").Integer
}else{
    Schema=require("../../../../packages/mandarina/src").Schema
    Integer=require("../../../../packages/mandarina/src").Integer
}

import "./Post";
import "./Address";
import "./Category";
import "./BlueCard";
import "./Car";


export const User = new Schema({
    id: {type: String},
    age: {type: Integer,},
    email: {type: String},
    name: {type: String},
    address: {type: 'Address'},
    categories: {type: ['Category']},
    posts: {type: ['Post']},
    blueCard: {type: 'BlueCard'},
    cars: {type: ['Car']},
}, {
    name: 'User',
})




