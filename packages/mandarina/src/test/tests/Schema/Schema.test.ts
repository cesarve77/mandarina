import 'jsdom-global/register'
import "../../schemas/Address";
import "../../schemas/Category";
import "../../schemas/Post";
import {User} from "../../schemas/User";


describe('Schema', () => {
    test('getFields', () => {
        const fields = User.getFields()
        expect(fields).toMatchObject([
            'id',
            'age',
            'email',
            'name',
            'address.country',
            'address.city',
            'categories.id',
            'categories.category',
            'posts.id',
            'posts.title',
            'posts.published',
            'posts.tags',
        ])
    })
})