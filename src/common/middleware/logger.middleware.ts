import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Removed custom LoggerMiddleware as morgan is now used for logging.