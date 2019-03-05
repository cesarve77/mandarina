import {Table, Context} from "./Table/Table";
import {CustomAction} from "./Action/CustomAction";
import {getConfig, loadSchemas} from "./cli/utils";


export default class Mandarina {
    static load() {
        const config=getConfig()
        loadSchemas(config.dir)
    }

    static config: MandarinaConfigDefault = {
        getUser: ({user}) => user,

    }

    static configure = (options: MandarinaConfigOptions) => {
        if (options.getUser) {
            Mandarina.config.getUser = options.getUser;
        }
    }

    static getQuery() {
        let Query = {}
        for (const tableName in Table.instances) {
            const table = Table.getInstance(tableName)
            Query = {...Query, ...table.getDefaultActions('query')}
        }
        return Query
    }

    static getMutation() {
        let Mutation = {}
        for (const tableName in Table.instances) {
            const table = Table.getInstance(tableName)
            Mutation = {...Mutation, ...table.getDefaultActions('mutation')}
        }
        for (const actionName in CustomAction.instances) {
            const action = CustomAction.getInstance(actionName)
            Mutation = {...Mutation, ...action.getActions()}
        }
        return Mutation
    }
}

type GetUser = (context: Context) => Promise<UserType | null | undefined> | UserType | null | undefined

export interface MandarinaConfigOptions {
    getUser?: GetUser
}

export interface MandarinaConfigDefault extends MandarinaConfigOptions {
    getUser: GetUser
}

export type UserType = {
    id: string
    roles: string[]
    [otherProperties: string]: any
}
