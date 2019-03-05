---
title: Mandarina
---

*package*: 'mandarina-server'

*description*: On server side you need to:
1. Load schemas, tables and actions with Mandarina.load()
2. Configure how mandarina extract de user from context with Mandarina.configure
3. Get de default query resolvers with Mandarina.getQuery 
3. Get de default mutation resolvers with Mandarina.getMutation 
4. Create your graphql server attaching prisma to resolver context

## 1) Mandarina.load

*where*: server

*type*: ()=>void

*description*: Mandarina.load() will seek a ["mandarina.json"](settings) located at the root of your project and it will load all schemas, tables and actions

*e.g.*: 
```typescript jsx
import Mandarina from "mandarina-server";
Mandarina.load()
```
 


## 2) Mandarina.configure

*where*: server

*type*:  (getUser: MandarinaConfigOptions)=>void

```typescript jsx
export type UserType = {
    id: string
    roles: string[]
    [otherProperties: string]: any
}

interface MandarinaConfigOptions {
    getUser: (context: Context) => Promise<UserType | null | undefined> | UserType | null | undefined
}
```

*description*: Configure mandarina to extract user from context

The context of all request should have the user (normally like a token). and Mandarina need to know how to get it.

the returned object by your custom getUser function must have at least the id of the user and the roles 
```typescript jsx
export type UserType = {
    id: string
    roles: string[]
    [otherProperties: string]: any
}
```


*e.g.*: 
```typescript jsx
import Mandarina from "mandarina-server";
import {getConfig} from 'mandarina-server'
import jwt from 'jsonwebtoken'

const config=getConfig()

export const getUser = async ({token, prisma}: Context) => {
    if (!token) return
    let user: { id: string, roles: string[] }
    try {
        user = jwt.verify(token, config.secret)
    } catch (e) {
        throw new Error('401 token expired!')
    }
    return user

}

Mandarina.configure({
    getUser: async (context) => {
        return await getUser(context)
    }
})
```
## 3) Mandarina.getQuery 

*where*: server

*type*: QueryResolver
```typescript jsx
interface QueryResolver{
    [resolverName: string]: (_: any, args: any = {}, context: Context, info: any) => any
    
}
```

*description*: get all default query resolver to all tables.

see: [Queries created by prisma](https://www.prisma.io/docs/prisma-graphql-api/reference/queries-qwe1/#overview)

*e.g.*: 
```typescript jsx
import Mandarina from "mandarina-server";

const Query = {...Mandarina.getQuery(), ...yourCustomResolvers}

```

## 4) Mandarina.getMutation 

*where*: server

*type*: MutationResolver
```typescript jsx
interface QueryResolver{
    [resolverName: string]: (_: any, args: any = {}, context: Context, info: any) => any
    
}
```

*description*: get all default mutation resolver to all tables.

see: [Queries created by prisma](https://www.prisma.io/docs/prisma-graphql-api/reference/queries-qwe1/#overview)

*e.g.*: 
```typescript jsx
import Mandarina from "mandarina-server";

const Muatation = {...Mandarina.getMuitation(), ...yourCustomResolvers}

```




*e.g.*: 
```typescript jsx
import './startup'
import {GraphQLServer} from "graphql-yoga";
import Mandarina ,{Auth} from "mandarina-server"
import path from 'path'
import {fileLoader, mergeTypes} from "merge-graphql-schemas";
import "../lib/schemas"
import "./tables"
import "./actions"
import "../lib/forms"
import prisma from "./prisma";
import {ContextParameters} from "graphql-yoga/dist/types";
import {Context as ContextTable} from 'mandarina-server/build/Table/Table'
import {Prisma} from "./generated/prisma";
import './fixtures'
import {config} from "./startup";


const authResolvers = config.options && config.options.auth ? Auth.resolvers : {}
const Query = {...Mandarina.getQuery(), ...authResolvers}
const Mutation = Mandarina.getMutation()

const inputs = fileLoader(path.join(process.cwd(), config.dir.prisma, 'datamodel/*.input.*'), {
    recursive: true,
    extensions: ['.graphql']
})
const operations = fileLoader(path.join(process.cwd(), config.dir.prisma, 'datamodel/*.operation.*'), {
    recursive: true,
    extensions: ['.graphql']
})

const generated = fileLoader(path.join(process.cwd(), config.dir.generated), {
    recursive: true,
    extensions: ['.graphql']
})

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

const server = new GraphQLServer({
    typeDefs,
    resolvers,
    context: (req: ContextParameters): Context => {
        console.log('last request:', new Date())
        let token = (<string>(req.request && req.request.headers && req.request.headers.authorization) || '').replace(/^Bearer /, '');
        return ({
            ...req,
            token,
            prisma,
        });
    },
})


const port = 8000;


server.start({port}, ({port}) => console.log(`GraphQL server is running on http://localhost:${port}`))

