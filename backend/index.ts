import app from "./src/app";
import {PORT } from './src/config/constant'



app.listen(
    PORT,
    () => {
        console.log(`Server running :${PORT}`);
    }
);