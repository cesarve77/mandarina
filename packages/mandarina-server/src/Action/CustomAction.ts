import {ErrorFromServerMapper, Schema} from "mandarina/build/Schema/Schema";
import {TableInstanceNotFound} from "../Errors/TableInstanceNotFound";
import {UniqueActionError} from "../Errors/UniqueActionError";

import {Permission} from "mandarina/build/Schema/Schema";



export class CustomAction {
    // An object with all table instances created
    static instances: { [actionName: string]: CustomAction };

    public schema?: Schema;
    public name: string;
    public options: ActionOptions
    public actions: ActionInterface


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
                    //todo: check permissions
                    return await actions[action].action(_, args, context, info)
                    // console.error('Actions permissions are not checked', this.permissions)
                    // if (this.options.onBefore) {
                    //     await this.options.onBefore(action, _, args, context, info)
                    // }
                    // const result = await actions[action].action(_, args, context, info)
                    // if (this.options.onAfter) {
                    //     this.options.onAfter(action, _, args, context, info)
                    // }
                    // return result
                }
                ;
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
