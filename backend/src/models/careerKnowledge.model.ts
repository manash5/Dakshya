import mongoose, { Document, Schema } from "mongoose";
import { CareerKnowledgeType } from "../types/careerKnowledge.types"; 

export interface ICareerKnowledge extends Omit<CareerKnowledgeType, "jobRoleId" | "lastUpdated" | "marketTrend">, Document {
  _id: mongoose.Types.ObjectId;
  jobRoleId: mongoose.Types.ObjectId;
  marketTrend: {
    trend: "Growing" | "Stable" | "Declining";
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date; // Replaces lastUpdated by utilizing Mongoose built-in timestamps
}


const RoadmapSchema = new Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  estimatedWeeks: { type: Number, required: true },
  requiredSkills: [{ type: String }],
  completionCriteria: { type: String, required: true },
  resources: [{ type: String }],
}, { _id: false });

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
  technologies: [{ type: String }],
  estimatedHours: { type: Number, required: true },
}, { _id: false });

const LearningResourceSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["Course", "Documentation", "Video", "Article"], required: true },
  url: { type: String, required: true },
}, { _id: false });


const CareerKnowledgeModelSchema: Schema = new Schema<ICareerKnowledge>(
  {
    jobRoleId: {
      type: Schema.Types.ObjectId,
      ref: "JobRole", 
      required: true,
      unique: true,
    },
    careerDescription: { type: String, required: true, trim: true },
    requiredSkills: [{ type: String }],
    tools: [{ type: String }],
    frameworks: [{ type: String }],
    certifications: [{ type: String }],
    
    roadmap: [RoadmapSchema],
    projects: [ProjectSchema],
    
    interviewGuide: {
      commonTopics: [{ type: String }],
      focusAreas: [{ type: String }],
      interviewTips: [{ type: String }],
      importantConcepts: [{ type: String }],
    },
    
    learningResources: [LearningResourceSchema],
    
    salary: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, required: true },
    },
    
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    futureDemand: { type: String, enum: ["Low", "Medium", "High", "Very High"], required: true },
    
    marketTrend: {
      trend: { type: String, enum: ["Growing", "Stable", "Declining"], required: true },
      updatedAt: { type: Date, default: Date.now },
    },
    
    estimatedCompletionMonths: { type: Number, required: true },
    aiGeneratedDate: { type: Date, required: true },
    isUpdating: { type: Boolean, default: false },
  },
  { 
    
    timestamps: true 
  }
);


CareerKnowledgeModelSchema.index({ difficulty: 1, futureDemand: 1 });


export default mongoose.model<ICareerKnowledge>(
  "CareerKnowledge",
  CareerKnowledgeModelSchema
);