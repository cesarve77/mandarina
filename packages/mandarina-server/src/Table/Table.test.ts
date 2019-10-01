import {Schema} from "mandarina";
import {Table} from "./Table";
import * as fs from 'fs'
import * as path from 'path'

describe('Table', () => {

    const prismaDir = path.join(__dirname + '../../../src/test/prisma')
    const schema = new Schema({
        id: {type: String},
        name: {
            type: [String],
            description: 'name',
            label: 'name',
            validators: ['required']
        }
    }, {name: 'Table1'})

    const schema2 = new Schema({
        id: {type: String},
        name: {
            type: String,
            description: 'name',
            label: 'name',
            validators: ['required']
        }
    }, {name: 'Table2'})


    test("saveFiles ", () => {
        const table2 = new Table(schema2)
        const filePath = path.join(prismaDir, 'datamodel/table2.graphql')
        const fileContent = fs.readFileSync(filePath, 'utf8')
        expect(fileContent).toBe('# Type for Table2\ntype Table2 {\n\t# name\n\tname: String!\n\tid: ID! @unique\n}');
    });
    const userTable = new Table(new Schema({
        name: {
            type: String,
            description: 'name',
            label: 'name',
            validators: ['required']
        },
        card: {
            type: 'Card',
            description: 'card on user',
            label: 'card on user',
            validators: ['required']
        }
    }, {name: 'User'}))

    // @ts-ignore
    const cardTable = new Table(new Schema({
        number: {
            type: Number,
            description: 'number',
            label: 'number',
            validators: ['required']
        },
        user: {
            type: 'User',
            description: 'user on card',
            label: 'user on card',
            validators: ['required']
        }
    }))

    test("getFields ", () => {
        expect(userTable.getFields()).toMatchObject(["name", "card.number", "card.id", "id"])
    });

    test("getDefaultActions ", () => {
        const resolvers = {
            Query: userTable.getDefaultActions('query'),
            Mutation: userTable.getDefaultActions('mutation')
        }
        expect(resolvers).toEqual(expect.objectContaining({
            Query: expect.objectContaining({
                user: expect.any(Function),
                users: expect.any(Function),
                usersConnection: expect.any(Function),
            }),
            Mutation: expect.objectContaining({
                createUser: expect.any(Function),
                updateUser: expect.any(Function),
                deleteUser: expect.any(Function),
                updateManyUsers: expect.any(Function),
                deleteManyUsers: expect.any(Function),
            }),
        }));


    });

