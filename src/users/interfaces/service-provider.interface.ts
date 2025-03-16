import { Document } from 'mongoose';
import { ServiceInterface } from '../../services/interfaces/service.interface';

export interface ServiceProviderInterface extends Document {
  profile_image?: string;
}
