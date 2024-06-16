// pages/api/hello.ts
"use server"
import { NextApiRequest , NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return res.status(200).json({ message: 'Hello from Next.js API!' });
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
