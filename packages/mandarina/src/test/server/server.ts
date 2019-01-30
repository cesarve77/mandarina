import {Address} from "../tables/Address";

//require('uniforms') //shuld be imported for  extends simple schema options
import {Prisma} from "prisma-binding";
import {GraphQLServer} from "graphql-yoga";
import {Table} from "../../../../mandarina-server/src/Table/Table";
import {User} from "../tables/User";
import {Post} from "../tables/Post";
import {Category} from "../tables/Category";

import path from 'path'
Table.configure({
    prismaDir: '/Users/cesarramos/Documents/projects/mandarina/packages/mandarina/src/test/prisma',
    getUserId: () => ''
})

let resolvers = {
    Query:{
        ...User.saveFiles().getDefaultResolvers('query'),
        ...Address.saveFiles().getDefaultResolvers('query'),
        ...Category.saveFiles().getDefaultResolvers('query'),
        ...Post.saveFiles().getDefaultResolvers('query'),
    },
    Mutation: {
        ...User.getDefaultActions('mutation'),
        ...Address.getDefaultActions('mutation'),
        ...Category.getDefaultActions('mutation'),
        ...Post.getDefaultActions('mutation'),
    }


}


const server = new GraphQLServer({
    typeDefs: 'src/test/server/generated/prisma.graphql',
    resolvers,

    context: req => ({
        ...req,
        prisma: new Prisma({
            typeDefs: path.join(Table.config.prismaDir , '../server/generated/prisma.graphql'),
            endpoint: 'http://192.168.99.100:4466',
        }),
    }),
})
const port = 7000;
server.start({port}, ({port}) => console.log(`GraphQL server is running on http://localhost:${port}`))