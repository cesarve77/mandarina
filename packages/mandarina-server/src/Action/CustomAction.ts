import {ErrorFromServerMapper, Permission, Schema} from "mandarina/build/Schema/Schema";
import {TableInstanceNotFound} from "../Errors/TableInstanceNotFound";
import {UniqueActionError} from "../Errors/UniqueActionError";
import Mandarina from "../Mandarina";
import {Hook} from "../Table/Table";


export class CustomAction {
    // An object with all table instances created
    static instances: { [actionName: string]: CustomAction };

    public schema?: Schema;
    public name: string;
    public options: ActionOptions
    public actions: ActionInterface
    protected static hook: Hook
    static setGlobalHook = (hook: Hook) => {
        CustomAction.hook = hook
    }

    /**
     *
     *
     * @param schema
     * @param actionOptions
     */
    constructor(schema: Schema | string, actionOptions: ActionOptions) {
        CustomAction.instances = CustomAction.instances || {};
        if (schema instanceof Schema) {
            this.schema = schema
            this.name = actionOptions.name || this.schema.name;
        } else {
            this.name = schema;
        }

        if (CustomAction.instances[this.name]) {
            throw new UniqueActionError(this.name);
        }
        this.actions = actionOptions.actions
        CustomAction.instances[this.name] = this;
    }


    static getInstance(name: string): CustomAction {
        if (!CustomAction.instances[name]) {
            throw new TableInstanceNotFound(name);
        }

        return CustomAction.instances[name];
    }

    getFields() {
        return this.schema && this.schema.getFields();
    }


    getActions() {
        const actions = this.actions || {};
        let result = {};

        Object.keys(actions).forEach((action) => {
                result[action] = async (_: any, args: any, context: any, info: any): Promise<any> => {
                    const user = await Mandarina.config.getUser(context)
                    const roles=(user && user.roles ) || []

                    const permissions: string[]= actions[action].permission || []
                    if (permissions.includes('nobody')){
                        throw new Error('Action not allowed')
                    }
                    if (permissions.includes('everybody') || permissions.some(permission=>roles.includes(permission))){
                        console.log('***************',`Action "${action}" not allowed for this user`,'***************')
                        console.warn(user && user.id,action)
                        console.warn(user && user.roles,permissions)
                        console.log('*****************************************************************************')
                        //throw new Error(`Action "${action}" not allowed for this user`)
                    }
                    if (CustomAction.hook) {
                        context.schemaName= this.name
                        context.name= action
                        await CustomAction.hook(_, args, context, info)
                        delete context.schemaName
                        delete context.name
                    }
                    return await actions[action].action(_, args, context, info)

                };
        });

        return result;
    }
}

export interface ActionOptions {
    name?: string,
    actions: ActionInterface
    errorFromServerMapper?: ErrorFromServerMapper
}


export interface ActionInterface {
    [name: string]: {
        permission?: Permission
        action: (_: any, args: any, context: any, info: any) => any | Promise<any>
        fields?: string[] | {
            [field: string]: Permission
        }
        result: string
    }
}
