import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

export const uploadFile = async (req, res) => {
    try {
      const file = req.file;
      const resourceType = req.body.resource_type || 'auto';
      if (!file) {
        return res.status(400).json({ error: "Файл не передан" });
      }
  
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "notes_app",
              resource_type: resourceType,
            },
            (error, result) => {
              if (result) resolve(result);
              else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };
  
      const result = await streamUpload(file.buffer);
      res.status(200).json({ success: true, url: result.secure_url, public_id: result.public_id });
    } catch (err) {
      res.status(500).json({ error: "Не удалось загрузить файл" });
    }
};

export const deleteFile = async (req, res) => {
  const { public_id, resource_type } = req.body;
  
  if (!public_id || !resource_type) {
    return res.status(400).json({ success: false, message: "public_id или resource_type не передан" });
  }
  
  try {
    const result = await cloudinary.uploader.destroy(public_id, { resource_type });

    if (result.result === "ok") {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Cloudinary не подтвердил удаление" });
    }
    // res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Ошибка при удалении из Cloudinary:", error);
    res.status(500).json({ success: false, message: "Ошибка при удалении файла" });
  }
};
    