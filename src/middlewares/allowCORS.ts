import { NextFunction, Request, Response } from 'express';

export const allowCORS = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Request-Method', '*');
  next();
};
