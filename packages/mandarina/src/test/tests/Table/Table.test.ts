import 'jsdom-global/register'
import {Table} from "../../../../../mandarina-server/src/Table/Table";
//import * as fs from 'fs'
import * as path from 'path'

import {Address} from "../../tables/Address";
import {Category} from "../../tables/Category";
import {Post} from "../../tables/Post";
import {User} from "../../tables/User";


describe('Table', () => {

    const prismaDir = path.join(__dirname + '../../prisma')
    Table.configure({prismaDir: prismaDir, getUserId: () => ''})
    Address.register()
    Category.register()
    Post.register()
    User.register()
    test('getFields',()=>{
        const fields=User.getFields()
        expect(fields).toMatchObject([ 'age',
            'email',
            'name',
            'address.country',
            'address.city',
            'address.id',
            'categories.category',
            'categories.id',
            'posts.title',
            'posts.published',
            'posts.tags',
            'posts.id',
            'id' ])
    })
})