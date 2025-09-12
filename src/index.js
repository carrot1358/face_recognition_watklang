import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

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
        console.log(`Saved image: ${filename}`);
      } else {
        // ถ้าเป็น text field (เช่น event_log)
        const content = file.buffer.toString('utf8');
        console.log(`Field ${file.fieldname}:`, content);
      }
    });
  }
  
  // ปริ้นทุกอย่างใน req.body
  console.log("Body type:", typeof req.body);
  console.log("Body:", req.body);

  res.status(200).end();
});

// รองรับ text body
app.use(express.text({ limit: '10mb', type: () => true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});