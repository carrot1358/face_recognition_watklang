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

export const getAppConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT, 10) || 8080,
  allowedIps: process.env.ALLOW_IPS ? process.env.ALLOW_IPS.split(',').map(ip => ip.trim()) : undefined,
});

export const getDatabaseConfig = (): DatabaseConfig => ({
  url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/hikvision_db',
});

export const parseMinioEndpoint = (endpoint: string) => {
  if (!endpoint) return { endPoint: 'localhost', port: 9000, useSSL: false };

  // Remove protocol if present
  const cleanEndpoint = endpoint.replace(/^https?:\/\//, '');

  // Check if SSL is used
  const useSSL = endpoint.startsWith('https://');

  // Split host and port
  const [host, portStr] = cleanEndpoint.split(':');
  const port = portStr ? parseInt(portStr) : (useSSL ? 443 : 80);

  return { endPoint: host, port, useSSL };
};

export const getMinioConfig = (): MinioConfig => {
  const endpointConfig = parseMinioEndpoint(process.env.MINIO_ENDPOINT);

  return {
    ...endpointConfig,
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'password123',
    bucket: process.env.MINIO_BUCKET || 'hikvision-images',
  };
};