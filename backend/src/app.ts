import express, { Application, NextFunction, Request, Response } from "express";
import { ApiResponseHelper } from './utils/api-response';
import { HttpException } from './exceptions/http-exceptions';
import cors from 'cors'; 
import userRoute from './routes/user.route'; 
import path from "path";
import adminUserRoutes from './routes/admin/user.route'
import universityRoute from './routes/university.route'
import adminUniversityRoute from './routes/admin/university.route'; 
import courseRoute from './routes/course.route'
import subjectRoute from './routes/subject.route'; 
import jobRoleRoute from './routes/jobRoles.route'
import adminCourseRoute from './routes/admin/course.route'
import adminSubjectRoute from './routes/admin/subject.route'
import adminJobRoleRoute from './routes/admin/jobRoles.route'
import adminCareerKnowledgeRouter from './routes/admin/careerKnowledge.route'
import jobPostingRoute from './routes/jobPosting.route'
import adminJobPostingRoute from './routes/admin/jobPosting.route'


const app: Application = express();
const corsOptions = {
    origin: ['http://localhost:3000'], // Explicitly allow your Next.js app port
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Authorizes your Bearer tokens
    credentials: true, // Crucial for letting headers pass through safely
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); 

app.use(express.json());// use json as request
app.use(express.urlencoded({ extended: true }));//use form-urlencoded as request

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/v1/auth", userRoute);
app.use('/api/v1/university', universityRoute)
app.use('/api/v1/course', courseRoute); 
app.use('/api/v1/subject', subjectRoute); 
app.use('/api/v1/jobRoles', jobRoleRoute); 
app.use('/api/v1/admin/university', adminUniversityRoute); 
app.use('/api/v1/admin/course', adminCourseRoute); 
app.use('/api/v1/admin/subject', adminSubjectRoute); 
app.use('/api/v1/admin/jobRoles', adminJobRoleRoute); 
app.use('/api/v1/admin/careerKnowledge', adminCareerKnowledgeRouter);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use('/api/v1/job-postings', jobPostingRoute);
app.use('/api/v1/admin/job-postings', adminJobPostingRoute);


app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({ message: "Route Not Found" });
    }
)

app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof HttpException) {
            return ApiResponseHelper.error(
                res, err.message, err.status
            );
        }

    }
);

export default app;