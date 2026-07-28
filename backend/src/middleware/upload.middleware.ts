import multer from "multer";
import path from "path";
import { Request } from "express";
import { HttpException } from "../exceptions/http-exceptions";
import fs from "fs";
import { randomUUID } from "crypto";
const storage = multer.diskStorage(
    {
        destination: (
            req: Request, 
            file: Express.Multer.File, 
            cb: (error: Error | null, destination: string) => void
        ) => {
            const uploadPath = path.join(__dirname, "../../uploads");
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
        },
        filename: (
            req: Request, 
            file: Express.Multer.File, 
            cb: (error: Error | null, filename: string) => void
        ) => {
            const fileSuffix = randomUUID();
            cb(null, fileSuffix + "-" + file.originalname);
        }
    }
);

const fileFilter = (
    req: Request, 
    file: Express.Multer.File, 
    cb: multer.FileFilterCallback
) => {
    if (
        file.mimetype === "image/jpeg" || 
        file.mimetype === "image/png"
    ) {
        cb(null, true);
    } else {
        cb(new HttpException(400, "Only JPEG and PNG files are allowed"));
    }
}
const upload = multer(
    {
        storage,
        limits: {
            fileSize: 1024 * 1024 * 5 // 5MB limit
        },
        fileFilter
    }
);

export const uploads = {
    single: (
        fieldName: string
    ) => upload.single(fieldName),
    array: (
        fieldName: string,
        maxCount: number
    ) => upload.array(fieldName, maxCount),
    fields: (
        fieldsArray: {
            name: string,
            maxCount?: number
        }[]
    ) => upload.fields(fieldsArray)
}

// Resume uploads go through a separate multer instance: memory storage
// (not disk) because the buffer needs to be forwarded to FastAPI for text
// extraction first -- resumeAnalysis.service.ts writes it to disk itself
// only after that succeeds, PDF-only (no image types), and its own size
// limit independent of the profile-picture uploader above.
const resumeFileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new HttpException(400, "Only PDF resumes are allowed"));
    }
};

const resumeUploadInstance = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    },
    fileFilter: resumeFileFilter
});

export const resumeUpload = resumeUploadInstance.single("resume");

// Audio uploads for interview transcription -- memory storage (the buffer
// goes straight to FastAPI/Whisper, never written to /uploads), and a wider
// mimetype allowlist than PDF/images since browser MediaRecorder output
// varies by browser (Chrome: audio/webm, Safari: audio/mp4, etc).
const AUDIO_MIME_TYPES = new Set([
    "audio/webm",
    "audio/ogg",
    "audio/wav",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp4",
    "audio/m4a",
    "audio/mp3",
]);

const audioFileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (AUDIO_MIME_TYPES.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new HttpException(400, "Unsupported audio format"));
    }
};

const audioUploadInstance = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 15 // 15MB limit -- a few minutes of spoken audio
    },
    fileFilter: audioFileFilter
});

export const audioUpload = audioUploadInstance.single("audio");