"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinioConfig = exports.parseMinioEndpoint = exports.getDatabaseConfig = exports.getAppConfig = void 0;
const getAppConfig = () => ({
    port: parseInt(process.env.PORT, 10) || 8080,
    allowedIps: process.env.ALLOW_IPS ? process.env.ALLOW_IPS.split(',').map(ip => ip.trim()) : undefined,
});
exports.getAppConfig = getAppConfig;
const getDatabaseConfig = () => ({
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/hikvision_db',
});
exports.getDatabaseConfig = getDatabaseConfig;
const parseMinioEndpoint = (endpoint) => {
    if (!endpoint)
        return { endPoint: 'localhost', port: 9000, useSSL: false };
    const cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
    const useSSL = endpoint.startsWith('https://');
    const [host, portStr] = cleanEndpoint.split(':');
    const port = portStr ? parseInt(portStr) : (useSSL ? 443 : 80);
    return { endPoint: host, port, useSSL };
};
exports.parseMinioEndpoint = parseMinioEndpoint;
const getMinioConfig = () => {
    const endpointConfig = (0, exports.parseMinioEndpoint)(process.env.MINIO_ENDPOINT);
    return {
        ...endpointConfig,
        accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
        secretKey: process.env.MINIO_SECRET_KEY || 'password123',
        bucket: process.env.MINIO_BUCKET || 'hikvision-images',
    };
};
exports.getMinioConfig = getMinioConfig;
//# sourceMappingURL=app.config.js.map