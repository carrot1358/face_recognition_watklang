import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import chalk from "chalk";

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

// ตั้งค่า multer
const upload = multer();

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Clear endpoint
app.post("/webhook/recieve/clear", (_req, res) => {
  res.status(200).end();
});

// Main endpoint
app.post("/webhook/recieve/httpHosts", upload.any(), (req, res) => {
  // ถ้ามี multipart files
  if (req.files && req.files.length > 0) {
    const imgDir = "data/imgs";
    fs.mkdirSync(imgDir, { recursive: true });

    req.files.forEach((file, index) => {
      if (file.mimetype?.startsWith('image/')) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
        const filename = `${timestamp}_${index}.${ext}`;
        const filepath = path.join(imgDir, filename);
        
        fs.writeFileSync(filepath, file.buffer);
        console.log(chalk.green.bold("Saved image:"), chalk.cyan(filename));
      } else {
        // ถ้าเป็น text field (เช่น event_log)
        const content = file.buffer.toString('utf8');
        console.log(chalk.blue.bold(`Field ${file.fieldname}:`), chalk.gray(content.substring(0, 100) + "..."));
      }
    });
  }
  
  // Parse event_log ถ้ามี
  if (req.body && req.body.event_log) {
    try {
      const eventData = JSON.parse(req.body.event_log);
      console.log(chalk.blue.bold("=== COMPLETE EVENT DATA ==="));
      console.log(prettyJSON(eventData));
      console.log(chalk.blue.bold("=============================="));
    } catch (e) {
      console.log(chalk.red.bold("❌ Failed to parse event_log:"), chalk.red(e.message));
      console.log(chalk.yellow("Raw event_log:"), req.body.event_log);
    }
  } else {
    // ปริ้นทุกอย่างใน req.body ถ้าไม่ใช่ event_log
    console.log(chalk.magenta.bold("=== COMPLETE BODY DATA ==="));
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
});