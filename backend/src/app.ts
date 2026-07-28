import express, { Application, NextFunction, Request, Response } from "express";
import { ApiResponseHelper } from './utils/api-response';
import { HttpException } from './exceptions/http-exceptions';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import dashboardRoute from './routes/dashboard.route'
import opportunityRoute from './routes/opportunity.route'
import adminOpportunityRoute from './routes/admin/opportunity.route'
import userProgressRoute from './routes/userProgress.route'
import savedJobRoute from './routes/savedJob.route'
import projectRoute from './routes/project.route'
import adminProjectRoute from './routes/admin/project.route'
import practiceAttemptRoute from './routes/practiceAttempt.route'
import resumeAnalysisRoute from './routes/resumeAnalysis.route'
import skillPlannerRoute from './routes/skillPlanner.route'


const app: Application = express();

// Comma-separated so both the local dev frontend and the deployed Vercel
// URL can be allowed at once (see ai-services/main.py's CORS_ALLOWED_ORIGINS
// for the same pattern).
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// crossOriginResourcePolicy relaxed so the frontend (different origin) can load /uploads images
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, success: false, message: "Too many attempts, please try again later." },
});
app.use(['/api/v1/auth/login', '/api/v1/auth/register'], authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/v1/dashboard', dashboardRoute);
app.use('/api/v1/opportunities', opportunityRoute);
app.use('/api/v1/admin/opportunities', adminOpportunityRoute);
app.use('/api/v1/userProgress', userProgressRoute);
app.use('/api/v1/saved-jobs', savedJobRoute);
app.use('/api/v1/projects', projectRoute);
app.use('/api/v1/admin/projects', adminProjectRoute);
app.use('/api/v1/practice-attempts', practiceAttemptRoute);
app.use('/api/v1/resume-analysis', resumeAnalysisRoute);
app.use('/api/v1/skill-planner', skillPlannerRoute);


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

        console.error("Unhandled error:", err);
        return ApiResponseHelper.error(res, "Internal Server Error", 500);
    }
);

export default app;