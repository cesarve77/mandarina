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
            this.name = this.schema.name;
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
                    console.log('*****************************************************')
                    console.log('action',action)
                    console.log('args',args)
                    let time = new Date().getTime()
                    const bm = (description?: string) => {
                        if (description) {
                            console.log(description, new Date().getTime() - time)
                        }
                        time = new Date().getTime()
                    }
                    bm()

                    const result= await actions[action].action(_, args, context, info)
                    console.log('result',result)
                    bm('done in ')
                    console.log('*****************************************************')
                    return result
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