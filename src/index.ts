import express from 'express';
import authRouter from './routes/auth.route';
import binRouter from './routes/bin.route';
import publicBinRouter from './routes/publicbin.route';
import dotenv from 'dotenv';
import { connectDB } from './lib/db';
const app = express();

dotenv.config();
app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/bin', binRouter);
app.use('/api/v1/public/bin', publicBinRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    connectDB();
})