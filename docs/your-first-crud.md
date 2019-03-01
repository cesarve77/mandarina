---
title: Your first CRUD
---

The central part of a mandarina application are [Schemas](schema-constructor) 

Let's build a very basic blog 

The first thing you need to do is set up a Schema. You can do it inside /app/lib/schemas

create /app/lib/schemas/Post.tsx

```typescript jsx
import {Schema} from 'mandarina'
const Post=new Schema({
        title: {type: String},
        text: {type: String}
    },
    {
        name: 'Post',
})
```
now import this files, added this file into create /app/lib/tables/index.ts

```typescript jsx
//...
import './Post.tsx'
```

With this you can create the create post form component as following

create /app/client/component/CreateFormPost.tsx

```typescript jsx
import {CreateForm} from 'mandarina-antd'
import {Post} from '/app/lib/schemas/Post'
export default ()=> <CreateForm table={Post}/>
```

That's all your CreatePostForm is 100% functional

in a similar way, you create UpdatePostForm and DeletePostForm

```typescript jsx
import {UpdateForm} from 'mandarina-antd'
import {Post} from '/app/lib/schemas/Post'
export default ({id})=> <UpdateForm table={Post} id={id}/>
```
```typescript jsx
import {DeleteForm} from 'mandarina-antd'
import {Post} from '/app/lib/schemas/Post'
export default ({id})=> <DeleteForm table={Post} id={id}/>
```

The list is so easy as

```typescript jsx
import {List} from 'mandarina-antd'
import {Post} from '/app/lib/schemas/Post'
export default ()=> <List table={Post}/>
```

and for get the post record use component [FindOne](find-one.md)
