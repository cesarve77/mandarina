import { Schema } from "..";
import React, { ElementType, ReactNode } from "react";
export declare type ActionType = 'create' | 'read' | 'update' | 'delete';
export interface AuthChildrenProps {
    fields: string[];
    readFields: string[];
    error: string;
    loading: boolean;
}
export interface AuthProps {
    action: ActionType;
    schema: Schema;
    userRoles?: string[];
    fields: string[];
    children: (props: any) => ReactNode;
}
export interface AuthElementsProps {
    denied?: ReactNode;
    Error?: ElementType<{
        error: string;
    }>;
    userRoles: string[];
    innerRef?: React.Ref<any>;
}
declare const Auth: ({ children, action, schema, userRoles, fields }: AuthProps) => React.ReactNode;
export default Auth;
export declare const actions: string[];
export declare const getFields: (args: AuthArgs) => string[];
export interface AuthArgs {
    fields: string[];
    schema: Schema;
    action: ActionType;
    userRoles?: string[];
}
