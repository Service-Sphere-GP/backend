export interface RequestUser {
  user_id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}
