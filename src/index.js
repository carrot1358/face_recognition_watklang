import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import chalk from "chalk";
import { Client as MinioClient } from "minio";

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
const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT?.split(':')[0] || 'localhost',
  port: parseInt(process.env.MINIO_ENDPOINT?.split(':')[1]) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'password123',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'hikvision-images';

// สร้าง bucket ถ้ายังไม่มี
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'ap-southeast-1');
      console.log(chalk.green.bold(`✅ Created MinIO bucket: ${BUCKET_NAME}`));
    } else {
      console.log(chalk.blue(`📦 MinIO bucket exists: ${BUCKET_NAME}`));
    }
  } catch (error) {
    console.log(chalk.red.bold(`❌ MinIO error: ${error.message}`));
  }
}

// เรียกสร้าง bucket ตอน start
ensureBucket();

// ตั้งค่า multer
const upload = multer();

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Clear endpoint
app.post("/webhook/recieve/clear", (_req, res) => {
  res.status(200).end();
});

// Main endpoint
app.post("/webhook/recieve/httpHosts", upload.any(), async (req, res) => {
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
          
          console.log(chalk.green.bold("📸 Saved to MinIO:"), chalk.cyan(filename));
          
          // สร้าง URL สำหรับเข้าถึงรูป
          const imageUrl = `https://${process.env.MINIO_ENDPOINT}/${BUCKET_NAME}/${filename}`;
          console.log(chalk.blue("🔗 Image URL:"), chalk.underline(imageUrl));
          
        } catch (error) {
          console.log(chalk.red.bold("❌ MinIO upload failed:"), chalk.red(error.message));
          
          // Fallback: เก็บใน local ถ้า MinIO ล้มเหลว
          const imgDir = "data/imgs";
          fs.mkdirSync(imgDir, { recursive: true });
          const filepath = path.join(imgDir, filename);
          fs.writeFileSync(filepath, file.buffer);
          console.log(chalk.yellow.bold("💾 Fallback to local:"), chalk.cyan(filename));
        }
      } else {
        // ถ้าเป็น text field (เช่น event_log)
        const content = file.buffer.toString('utf8');
        console.log(chalk.blue.bold(`📄 Field ${file.fieldname}:`), chalk.gray(content.substring(0, 100) + "..."));
      }
    }
  }
  
  // Parse event_log ถ้ามี
  if (req.body && req.body.event_log) {
    try {
      const eventData = JSON.parse(req.body.event_log);
      console.log(chalk.blue.bold("=== 📊 COMPLETE EVENT DATA ==="));
      console.log(prettyJSON(eventData));
      console.log(chalk.blue.bold("=============================="));
    } catch (e) {
      console.log(chalk.red.bold("❌ Failed to parse event_log:"), chalk.red(e.message));
      console.log(chalk.yellow("Raw event_log:"), req.body.event_log);
    }
  } else if (req.body) {
    // ปริ้นทุกอย่างใน req.body ถ้าไม่ใช่ event_log
    console.log(chalk.magenta.bold("=== 📦 COMPLETE BODY DATA ==="));
    console.log(chalk.cyan("Body type:"), chalk.yellow(typeof req.body));
    console.log(prettyJSON(req.body));
    console.log(chalk.magenta.bold("============================="));
  }

  res.status(200).end();
});

// รองรับ text body
app.use(express.text({ limit: '10mb', type: () => true }));

app.listen(PORT, () => {
  console.log(chalk.green.bold(`🚀 Server running on port ${PORT}`));
  console.log(chalk.blue(`📦 MinIO Console: http://localhost:9001`));
  console.log(chalk.blue(`🖼️  Images stored in bucket: ${BUCKET_NAME}`));
});
