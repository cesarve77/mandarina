export declare const getConfig: () => ConfigInterface;
export interface ConfigInterface {
    database: {
        url: string;
    };
    prisma: {
        port: string;
        host: string;
        database?: string;
        stage?: string;
        generatorClient?: string;
    };
    dir: ConfigDirInterface;
    options?: {
        auth: boolean;
    };
    secret?: string;
    customSettings: {
        [props: string]: any;
    };
}
export interface ConfigDirInterface {
    schemas: string[];
    tables?: string[];
    actions?: string[];
    generated: string;
    prisma: string;
    prisma2: string;
}
export declare const loadSchemas: (dir: ConfigDirInterface) => void;
