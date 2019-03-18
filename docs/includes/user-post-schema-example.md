import {Schema} from 'mandarina'
const User=new Schema({
    firstName: {type: String, validators:['required']}, 
    posts: {type: ['Post']} // Where Post is another schema named 'Post' see below
}, {
    name: 'User'
})

const Post=new Schema({
    post: {type: String}, 
    tags:  {type: [String]},
    comments: {type: ['Comment']}, //  Where Comment is another schema named 'Comment' not showing in this example
    author: {type: 'User'} // Where post is another schema named 'Post'
}, {
    name: 'Post'
})
