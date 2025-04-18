import { Document } from 'mongoose';

export interface CustomerInterface extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_image?: string;
}
