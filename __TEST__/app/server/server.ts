import {Address} from "../lib/schemas/Address";
import {ContextParameters} from "graphql-yoga/dist/types";

//require('uniforms') //shuld be imported for  extends simple schema options
import {GraphQLServer} from "graphql-yoga";
import {fileLoader, mergeTypes} from "merge-graphql-schemas";
import {Prisma} from "./generated/prisma";


import Mandarina,{getConfig} from "../../../packages/mandarina-server";
import * as path from 'path'
import prisma from "./prisma";


 const config = getConfig()
Mandarina.load()
Mandarina.configure({
    getUser: () =>({id:'user1',roles:[]})
})

let resolvers = {
    Query:{ ...Mandarina.getQuery()
    },
    Mutation: {
        ...Mandarina.getMutation()
    }


}

const inputs = fileLoader(path.join(__dirname, '../../prisma/datamodel/*.input.*'), {
    recursive: true,
    extensions: ['.graphql']
})
const operations = fileLoader(path.join(__dirname, '../../prisma/datamodel/*.operation.*'), {
    recursive: true,
    extensions: ['.graphql']
})
const generated = fileLoader(path.join(__dirname, './generated'), {recursive: true, extensions: ['.graphql']})

const typeDefs = mergeTypes([...generated, ...inputs, ...operations], {all: true})





// @ts-ignore
export interface Context extends ContextTable {
    prisma: Prisma
    token?: string

    [rest: string]: any
}

let i = 0
const server = new GraphQLServer({

    typeDefs,
    resolvers,
    context: (req: ContextParameters): Context => {
        return ({
            ...req,
            prisma,
        });
    },
})


const port = 8001;


server.start({
    tracing: true,
    port,
    cors: {
        credentials: true,
        origin: true
    },
}, ({port}) => console.log(`GraphQL server is running on http://localhost:${port}`))


