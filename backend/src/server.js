import express from 'express';
import healthRoutes from './routes/health.routes.js';
const app=express();
const PORT=8000;

app.use('/health',healthRoutes)

app.listen(PORT,(req,res)=>{
    console.log(`Server running at http://localhost:${PORT}`);
});

