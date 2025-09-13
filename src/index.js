import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import chalk from "chalk";
import { Client as MinioClient } from "minio";
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import dotenv from "dotenv";

// โหลด environment variables จาก .env file
dotenv.config();

// สร้าง Prisma client
const prisma = new PrismaClient();

// สร้าง Winston logger
const logger = winston.createLogger({
  level: 'debug', // เปลี่ยนเป็น debug เพื่อแสดง debug logs
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console({ level: 'debug' }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// สร้าง logs directory
fs.mkdirSync('logs', { recursive: true });

// ฟังก์ชันสำหรับแสดง JSON แบบมีสี
function prettyJSON(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  
  if (typeof obj === 'string') {
    return chalk.green(`"${obj}"`);
  } else if (typeof obj === 'number') {
    return chalk.yellow(obj);
  } else if (typeof obj === 'boolean') {
    return chalk.magenta(obj);
  } else if (obj === null) {
    return chalk.gray('null');
  } else if (Array.isArray(obj)) {
    if (obj.length === 0) return chalk.gray('[]');
    let result = chalk.gray('[\n');
    obj.forEach((item, index) => {
      result += `${spaces}  ${prettyJSON(item, indent + 1)}`;
      if (index < obj.length - 1) result += chalk.gray(',');
      result += '\n';
    });
    result += `${spaces}${chalk.gray(']')}`;
    return result;
  } else if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return chalk.gray('{}');
    
    let result = chalk.gray('{\n');
    keys.forEach((key, index) => {
      result += `${spaces}  ${chalk.blue.bold(`"${key}"`)}: ${prettyJSON(obj[key], indent + 1)}`;
      if (index < keys.length - 1) result += chalk.gray(',');
      result += '\n';
    });
    result += `${spaces}${chalk.gray('}')}`;
    return result;
  }
  
  return String(obj);
}

const app = express();
const PORT = 8080;

// ตั้งค่า MinIO Client
function parseMinioEndpoint(endpoint) {
  if (!endpoint) return { endPoint: 'localhost', port: 9000, useSSL: false };
  
  // ถ้ามี protocol ให้ลบออก
  const cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
  
  // ตรวจสอบว่าใช้ SSL หรือไม่
  const useSSL = endpoint.startsWith('https://');
  
  // แยก host และ port
  const [host, portStr] = cleanEndpoint.split(':');
  const port = portStr ? parseInt(portStr) : (useSSL ? 443 : 80);
  
  return { endPoint: host, port, useSSL };
}

const minioConfig = parseMinioEndpoint(process.env.MINIO_ENDPOINT);
const minioClient = new MinioClient({
  ...minioConfig,
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'password123',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'hikvision-images';

// สร้าง bucket ถ้ายังไม่มี และตั้งค่า public access
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'ap-southeast-1');
      logger.info(`Created MinIO bucket: ${BUCKET_NAME}`);
    } else {
      logger.info(`MinIO bucket exists: ${BUCKET_NAME}`);
    }

    // ตั้งค่า bucket policy ให้ public read-only access (ไม่สามารถ upload ได้)
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'], // อ่านได้อย่างเดียว ไม่สามารถ PUT/POST ได้
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
        }
      ]
    };

    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    logger.info(`Set public read policy for bucket: ${BUCKET_NAME}`);
    
  } catch (error) {
    logger.error(`MinIO error: ${error.message}`);
    // ถ้าตั้ง policy ไม่ได้ ให้แจ้งเตือนแต่ไม่ stop
    if (error.message.includes('policy')) {
      logger.warn(`Cannot set bucket policy - images may not be publicly accessible`);
    }
  }
}

// เรียกสร้าง bucket ตอน start
ensureBucket();

// ตั้งค่า multer
const upload = multer();

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// MinIO Test Endpoints
app.get("/minio/test", async (_req, res) => {
  try {
    logger.info("Testing MinIO connection...");
    logger.info(`Endpoint: ${minioConfig.endPoint}`);
    logger.info(`Port: ${minioConfig.port}`);
    logger.info(`SSL: ${minioConfig.useSSL}`);
    logger.info(`Access Key: ${process.env.MINIO_ACCESS_KEY || 'admin'}`);
    
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    
    res.json({
      status: "success",
      connected: true,
      bucket: BUCKET_NAME,
      bucketExists: exists,
      endpoint: `${minioConfig.useSSL ? 'https' : 'http'}://${minioConfig.endPoint}:${minioConfig.port}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`MinIO test error: ${error.message}`, error);
    
    res.status(500).json({
      status: "error",
      connected: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

app.post("/minio/upload-test", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = req.file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `test_${timestamp}.${ext}`;
    
    await minioClient.putObject(BUCKET_NAME, filename, req.file.buffer, req.file.size, {
      'Content-Type': req.file.mimetype
    });
    
    const protocol = minioConfig.useSSL ? 'https' : 'http';
    const portSuffix = (minioConfig.port === 80 || minioConfig.port === 443) ? '' : `:${minioConfig.port}`;
    const imageUrl = `${protocol}://${minioConfig.endPoint}${portSuffix}/${BUCKET_NAME}/${filename}`;
    
    logger.info(`Test upload to MinIO: ${filename}`);
    
    res.json({
      status: "success",
      filename: filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: imageUrl,
      bucket: BUCKET_NAME,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error(`MinIO test upload failed: ${error.message}`);
    
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post("/minio/set-public-policy", async (_req, res) => {
  try {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'], // อ่านได้อย่างเดียว ไม่สามารถ upload ได้
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
        }
      ]
    };

    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    logger.info(`Manually set public policy for: ${BUCKET_NAME}`);
    
    res.json({
      status: "success",
      message: `Public read policy set for bucket: ${BUCKET_NAME}`,
      bucket: BUCKET_NAME,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error(`Failed to set bucket policy: ${error.message}`);
    
    res.status(500).json({
      status: "error",
      error: error.message,
      bucket: BUCKET_NAME,
      timestamp: new Date().toISOString()
    });
  }
});

// Clear endpoint
app.post("/webhook/recieve/clear", (_req, res) => {
  res.status(200).end();
});

// Test mapping endpoint
app.post("/test/mapping", express.json(), (req, res) => {
  try {
    const eventData = req.body;
    const accessControlEvent = eventData?.AccessControllerEvent;
    
    const mappedData = {
      eventId: eventData?.serialNo?.toString() || accessControlEvent?.serialNo?.toString() || null,
      eventType: eventData?.eventType || null,
      deviceId: eventData?.macAddress || eventData?.ipAddress || null,
      deviceName: accessControlEvent?.deviceName || "Access Controller",
      personId: accessControlEvent?.employeeNoString || null,
      personName: accessControlEvent?.name || null,
      cardNumber: accessControlEvent?.cardNo || null,
      doorId: eventData?.channelID?.toString() || null,
      doorName: null,
      accessResult: accessControlEvent?.statusValue === 0 ? "success" : "failed",
      rawData: eventData
    };

    logger.debug("Test mapping result:", JSON.stringify({
      original: eventData,
      mapped: mappedData,
      accessControlEvent: accessControlEvent
    }, null, 2));

    res.json({
      status: "success",
      original: eventData,
      mapped: mappedData,
      accessControlEvent: accessControlEvent
    });

  } catch (error) {
    logger.error(`Test mapping error: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
});

// Database query endpoints
app.get("/api/events", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    logger.debug("API /events query parameters:", JSON.stringify({
      limit,
      offset,
      originalQuery: req.query
    }, null, 2));
    
    const events = await prisma.accessEvent.findMany({
      include: {
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });
    
    const total = await prisma.accessEvent.count();
    
    const response = {
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };

    logger.debug("API /events response:", JSON.stringify({
      eventCount: events.length,
      total,
      pagination: response.pagination
    }, null, 2));
    
    res.json(response);
    
  } catch (error) {
    logger.error(`Database query error: ${error.message}`);
    res.status(500).json({
      error: "Database query error",
      message: error.message
    });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
    logger.debug("API /events/:id request:", JSON.stringify({
      eventId,
      originalParam: req.params.id
    }, null, 2));
    
    const event = await prisma.accessEvent.findUnique({
      where: { id: eventId },
      include: {
        images: true
      }
    });
    
    if (!event) {
      logger.debug("Event not found:", JSON.stringify({ eventId }, null, 2));
      return res.status(404).json({ error: "Event not found" });
    }
    
    logger.debug("API /events/:id response:", JSON.stringify({
      eventId: event.id,
      imageCount: event.images?.length || 0
    }, null, 2));
    
    res.json(event);
    
  } catch (error) {
    logger.error(`Database query error: ${error.message}`);
    res.status(500).json({
      error: "Database query error",
      message: error.message
    });
  }
});

// Main endpoint
app.post("/webhook/recieve/httpHosts", upload.any(), async (req, res) => {
  let eventData = null;
  let savedImages = [];
  
  try {
    // Debug: แสดง raw request data
    logger.debug("Raw Request Headers:", JSON.stringify(req.headers, null, 2));
    logger.debug("Raw Request Body:", JSON.stringify(req.body, null, 2));
    logger.debug("Raw Request Files:", req.files ? req.files.map(f => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size
    })) : 'No files');

    // Parse event_log ถ้ามี
    if (req.body && req.body.event_log) {
      try {
        eventData = JSON.parse(req.body.event_log);
        logger.info("Received event data:", JSON.stringify(eventData, null, 2));
        logger.debug("Parsed event_log JSON:", JSON.stringify(eventData, null, 2));
      } catch (e) {
        logger.error(`Failed to parse event_log: ${e.message}`);
        logger.warn(`Raw event_log: ${req.body.event_log}`);
        logger.debug("Raw event_log string:", JSON.stringify(req.body.event_log, null, 2));
      }
    } else if (req.body) {
      logger.info("Received body data:", JSON.stringify(req.body, null, 2));
      logger.debug("Complete body structure:", JSON.stringify(req.body, null, 2));
    }

    // สร้าง AccessEvent record ใน database
    // Map ข้อมูลจาก Hikvision format ให้ตรงกับ database schema
    const accessControlEvent = eventData?.AccessControllerEvent;
    
    const dbData = {
      eventId: eventData?.serialNo?.toString() || accessControlEvent?.serialNo?.toString() || null,
      eventType: eventData?.eventType || null,
      deviceId: eventData?.macAddress || eventData?.ipAddress || null,
      deviceName: accessControlEvent?.deviceName || "Access Controller",
      personId: accessControlEvent?.employeeNoString || null,
      personName: accessControlEvent?.name || null,
      cardNumber: accessControlEvent?.cardNo || null,
      doorId: eventData?.channelID?.toString() || null,
      doorName: null, // ไม่มีใน raw data
      accessResult: accessControlEvent?.statusValue === 0 ? "success" : "failed",
      rawData: eventData || req.body || {}
    };

    logger.debug("Raw event data structure:", JSON.stringify({
      eventData: eventData,
      accessControlEvent: accessControlEvent,
      eventDataKeys: eventData ? Object.keys(eventData) : [],
      accessControlKeys: accessControlEvent ? Object.keys(accessControlEvent) : []
    }, null, 2));

    logger.debug("Database insert data:", JSON.stringify(dbData, null, 2));

    const accessEvent = await prisma.accessEvent.create({
      data: dbData
    });

    logger.info(`Saved event to database with ID: ${accessEvent.id}`);
    logger.debug("Created database record:", JSON.stringify(accessEvent, null, 2));

    // ถ้ามี multipart files
    if (req.files && req.files.length > 0) {
      for (const [index, file] of req.files.entries()) {
        if (file.mimetype?.startsWith('image/')) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const ext = file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
          const filename = `${timestamp}_${index}.${ext}`;
          
          try {
            // เก็บใน MinIO
            await minioClient.putObject(BUCKET_NAME, filename, file.buffer, file.size, {
              'Content-Type': file.mimetype
            });
            
            // สร้าง URL สำหรับเข้าถึงรูป
            const protocol = minioConfig.useSSL ? 'https' : 'http';
            const portSuffix = (minioConfig.port === 80 || minioConfig.port === 443) ? '' : `:${minioConfig.port}`;
            const imageUrl = `${protocol}://${minioConfig.endPoint}${portSuffix}/${BUCKET_NAME}/${filename}`;
            
            // บันทึกข้อมูลรูปภาพลง database
            const imageData = {
              eventId: accessEvent.id,
              filename: filename,
              originalName: file.originalname || null,
              mimeType: file.mimetype,
              size: file.size,
              minioPath: `${BUCKET_NAME}/${filename}`,
              publicUrl: imageUrl
            };

            logger.debug("Image database insert data:", JSON.stringify(imageData, null, 2));

            const savedImage = await prisma.accessImage.create({
              data: imageData
            });

            savedImages.push(savedImage);
            logger.info(`Saved image to MinIO and DB: ${filename}`);
            logger.info(`Image URL: ${imageUrl}`);
            logger.debug("Saved image record:", JSON.stringify(savedImage, null, 2));
            
          } catch (error) {
            logger.error(`MinIO upload failed: ${error.message}`);
            
            // Fallback: เก็บใน local ถ้า MinIO ล้มเหลว
            const imgDir = "data/imgs";
            fs.mkdirSync(imgDir, { recursive: true });
            const filepath = path.join(imgDir, filename);
            fs.writeFileSync(filepath, file.buffer);
            
            // บันทึกข้อมูลรูปภาพลง database แม้เก็บ local
            const localImageData = {
              eventId: accessEvent.id,
              filename: filename,
              originalName: file.originalname || null,
              mimeType: file.mimetype,
              size: file.size,
              minioPath: `local/${filename}`,
              publicUrl: `/data/imgs/${filename}`
            };

            logger.debug("Local image database insert data:", JSON.stringify(localImageData, null, 2));

            const savedImage = await prisma.accessImage.create({
              data: localImageData
            });

            savedImages.push(savedImage);
            logger.warn(`Fallback to local storage: ${filename}`);
            logger.debug("Local saved image record:", JSON.stringify(savedImage, null, 2));
          }
        } else {
          // ถ้าเป็น text field (เช่น event_log)
          const content = file.buffer.toString('utf8');
          logger.info(`Field ${file.fieldname}: ${content.substring(0, 100)}...`);
          logger.debug(`Complete field ${file.fieldname}:`, JSON.stringify({
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            content: content
          }, null, 2));
        }
      }
    }

    logger.info(`Processing complete - Event ID: ${accessEvent.id}, Images: ${savedImages.length}`);
    logger.debug("Final processing summary:", JSON.stringify({
      eventId: accessEvent.id,
      totalImages: savedImages.length,
      imageDetails: savedImages.map(img => ({
        id: img.id,
        filename: img.filename,
        size: img.size,
        url: img.publicUrl
      }))
    }, null, 2));

    res.status(200).end();

  } catch (error) {
    logger.error(`Database error: ${error.message}`, error);
    logger.debug("Error details:", JSON.stringify({
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      requestFiles: req.files?.map(f => ({
        fieldname: f.fieldname,
        size: f.size,
        mimetype: f.mimetype
      }))
    }, null, 2));

    res.status(500).json({
      error: "Database error",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// รองรับ text body
app.use(express.text({ limit: '10mb', type: () => true }));

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`MinIO Console: https://minio-console.sylorqynvex.cc`);
  logger.info(`Images stored in bucket: ${BUCKET_NAME}`);
  
  try {
    await prisma.$connect();
    logger.info(`Connected to database successfully`);
  } catch (error) {
    logger.error(`Failed to connect to database: ${error.message}`);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down server...');
  await prisma.$disconnect();
  logger.info('Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down server...');
  await prisma.$disconnect();
  logger.info('Database disconnected');
  process.exit(0);
});
