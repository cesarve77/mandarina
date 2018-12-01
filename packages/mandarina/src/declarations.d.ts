declare module 'browser-or-node' {
    export function isBrowser(): boolean
}

interface FlatObj {
    [key: string]: any
}

interface FlatOptions {
    delimiter?: string
    safe?: boolean
    object?: boolean
    overwrite?: boolean
    maxDepth?: number

}

declare module 'flat' {
    export function flatter(original: any, options?: FlatOptions): FlatObj

    export function unflatten(original: FlatObj, options?: FlatOptions): any
}