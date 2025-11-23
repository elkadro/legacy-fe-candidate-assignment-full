import { Request, RequestHandler, Response, Router } from "express";

const router = Router();

/**
 * @route   GET /metrics/
 * @desc    Gets the metrics in prometheus response structure
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  const client = (req as any).prometheus;
  res.setHeader('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});



export default router;
