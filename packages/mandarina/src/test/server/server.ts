import {Address} from "../schemas/Address";

//require('uniforms') //shuld be imported for  extends simple schema options
import {Prisma} from "prisma-binding";
import {GraphQLServer} from "graphql-yoga";
import {Schema} from "../../../../mandarina/src/Schema/Schema";
import {User} from "../schemas/User";
import {Post} from "../schemas/Post";
import {Category} from "../schemas/Category";

import Mandarina,{getConfig} from "../../../../mandarina-server/src";
import path from "path";


 const config = getConfig()


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


let resolvers = {
    Query,
    Mutation
}



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
        const cookies = new Cookies(req.request.headers.cookie);
        console.log(i++, new Date())
        let token = cookies.get('StudyTourSystem__AuthToken')
        return ({
            ...req,
            token,
            prisma,
        });
    },
})


const port = 8000;

server.express.get(pathFile, routeFile)

server.start({
    tracing: true,
    port,
    cors: {
        credentials: true,
        origin: true
    },
}, ({port}) => console.log(`GraphQL server is running on http://localhost:${port}`))


