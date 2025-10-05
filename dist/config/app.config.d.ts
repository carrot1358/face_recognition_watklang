export interface AppConfig {
    port: number;
    allowedIps?: string[];
}
export interface MinioConfig {
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
}
export interface DatabaseConfig {
    url: string;
}
export declare const getAppConfig: () => AppConfig;
export declare const getDatabaseConfig: () => DatabaseConfig;
export declare const parseMinioEndpoint: (endpoint: string) => {
    endPoint: string;
    port: number;
    useSSL: boolean;
};
export declare const getMinioConfig: () => MinioConfig;
