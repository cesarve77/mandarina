import {Schema} from "../Schema/Schema";
import {Table} from "./Table";
import * as fs from 'fs'
import * as path from 'path'
import {buildInterfaceName} from "./utils";

describe('Table', () => {

    const prismaDir = path.join(__dirname + '../../../src/test/prisma')
    Table.configure({prismaDir: prismaDir, getUser: () =>null})
    const schema = new Schema({
        name: {
            type: [String],
            description: 'name',
            label: 'name',
            validators: ['required']
        }
    }, {name: 'Table1'})


    test("getGraphQLSchema ", () => {
        const table1 = new Table(schema, {name: 'Table1'})
        expect(table1).toBeInstanceOf(Table);
        expect(Table.getInstance('Table1')).toBeInstanceOf(Table);
        expect(() => Table.getInstance('UnexistentTable')).toThrow();
        expect(table1.getGraphQLModel()).toBe('# Type for Table1\ntype Table1 {\n\t# name\n\tname: [String!]!\n\tid: ID! @unique\n}');
    });
    const schema2 = new Schema({
        name: {
            type: String,
            description: 'name',
            label: 'name',
            validators: ['required']
        }
    }, {name: 'Table2'})


    test("saveFiles ", () => {
        const table2 = new Table(schema2, {name: 'Table2'})
        table2.saveFiles()
        const filePath = path.join(prismaDir, 'datamodel/table2.graphql')
        const fileContent = fs.readFileSync(filePath, 'utf8')
        expect(fileContent).toBe('# Type for Table2\ntype Table2 {\n\t# name\n\tname: String!\n\tid: ID! @unique\n}');
    });
    const userTable = new Table({
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
    }, {name: 'User'})

    // @ts-ignore
    const cardTable = new Table({
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
    }, {name: 'Card'})

    test("getFields ", () => {
        expect(userTable.getFields()).toMatchObject(["name", "card.number", "card.id", "id"])
    });

    test("getDefaultResolvers ", () => {
        const resolvers = {
            Query: userTable.getDefaultResolvers('query'),
            Mutation: userTable.getDefaultResolvers('mutation')
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

    test("saveDeclarationFiles", () => {

        jest.mock('fs', () => {
            return {
                writeFileSync: jest.fn()
        }
        });
        expect(userTable.path).toBe(__dirname)
        const fs=require('fs')
        userTable.saveDeclarationFiles()
        expect(fs.writeFileSync.mock.calls[0][0]).toBe(userTable.path + '/' + buildInterfaceName(userTable) + '.ts')
        expect(fs.writeFileSync.mock.calls[0][1]).toBe('import {CardTableInterface} from "./CardTableInterface"\nexport interface UserTableInterface {\n' +
            '    name: string\n' +
            '    card: CardTableInterface\n' +
            '    id?: string\n' +
            '}')

    })
})