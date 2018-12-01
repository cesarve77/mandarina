---
title: Table - Static methods
sidebar_label: Static methods
---


## 1) Table.configure
*where*: server

*type*:  (param: Object)=>void

*description*: Configure is a function which takes 1 params as a Object. [See next](#configureParam).

And should be called at the very beginning of your server startup

*e.g.*:
```typescript jsx
Table.configure({
    prismaDir: './prisma',
    getUser:(context)=>({id: context.user.id, roles: context.user.roles }),
})
```

### 1.1) param.getUser<a name="configureParam"></a>
*where*: server

*type*: (context: Context)=>{id: string, roles: string[]}

*description*: This function take the context in the all GraphQL request and should return the user with at least the id and the array of roles.

*e.g.*:
```typescript jsx
Table.configure({getUser:(context)=>({id: context.user.id, roles: context.user.roles })
```

### 1.2) param.prismaDir
*where*: server

*type*: string

*description*: a relative oath toi the prisma directory 

*e.g.*:
```typescript jsx
Table.configure({prismaDir: './prisma'})
```

## 2) Table.getInstance
*where*: server && client

*type*: (tableName: string)=>Table

*description*: This function take the name of the table and return the table instance

*e.g.*:
```js
const User=Table.getInstance('User')
```
 