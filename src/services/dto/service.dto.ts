export class ServiceDto {
  service_name: string;
  service_attributes: Record<string, string>;
  base_price: number;
  status: string;
  description?: string;
  category?: string;
  creation_time: Date;
  service_provider_id?: string;
}