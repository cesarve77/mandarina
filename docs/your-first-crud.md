---
title: Your first CRUD
---

The central part of a mandarina application are [tables](table-constructor) 

Let's build a very basic blog functionalities

The first thing you need to do is set up a table. You can do it inside /app/lib/tables

create /app/lib/tables/Post.tsx

```typescript jsx
import {Table} from 'mandarina'
const Post=new Table({
        title: {type: String},
        text: {type: String}
    },
    {
        name: 'Post',
})
```

now added this file into create /app/lib/tables/index.ts

```typescript jsx
//...
import './Post.tsx'
```

With this you can create the create post form component as following

```typescript jsx
import {CreateForm} from 'mandarina'
import '/app/lib/tables/Post'
export default ()=> <CreatePostForm table={Post}/>
```

That's all your CreatePostForm is 100% functional

in a similar way, you create UpdatePostForm and DeletePostForm

```typescript jsx
import {UpdateForm} from 'mandarina-antd'
import '/app/lib/tables/Post'
export default ({id})=> <UpdateForm table={Post} id={id}/>
```
```typescript jsx
import {DeleteForm} from 'mandarina-antd'
import '/app/lib/tables/Post'
export default ({id})=> <DeletePostForm table={Post} id={id}/>
```

The list is so easy as

```typescript jsx
import {List} from 'mandarina-antd'
import '/app/lib/tables/Post'
export default ()=> <List table={Post}/>
```

and for get the post record use component [FindOne](find-one.md)
