import {Schema} from "../..";

export const Post = new Schema({
    id: {type: String},
    title: {type: String},
    published: {type: Boolean},
    tags: {type: [String]},
    user: {type: 'User'},
}, {
    name: 'Post',
})

