import express from 'express';
import { Application } from 'express';


const app: Application = express();

app.use(express.json());// use json as request
app.use(express.urlencoded({ extended: true }));//use form-urlencoded as request


export default app;