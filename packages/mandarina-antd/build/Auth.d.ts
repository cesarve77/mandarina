/// <reference types="react" />
import { CreateFormProps, UpdateFormProps } from "./Forms";
import { AuthElementsProps } from "mandarina/build/Auth/Auth";
import { ListProps as ListVirtualizedProps } from "./List/ListVirtualized";
import { ListProps } from "./List/List";
export declare const AuthUpdateForm: (props: UpdateFormProps & AuthElementsProps) => JSX.Element;
export declare const AuthCreateForm: (props: CreateFormProps & AuthElementsProps) => JSX.Element;
export declare const AuthList: (props: ListProps & AuthElementsProps) => JSX.Element;
export declare const AuthListVirtualized: (props: ListVirtualizedProps & AuthElementsProps) => JSX.Element;
