import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { Admin } from '../users/schemas/admin.schema';
import { Customer } from '../users/schemas/customer.schema';
import { ServiceProvider } from '../users/schemas/service-provider.schema';
import { Service } from '../services/schemas/service.schema';
import { getModelToken } from '@nestjs/mongoose';
import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';

const generateAdmin = (): Partial<Admin> => ({
  first_name: 'AdminFirstName',
  last_name: 'AdminLastName',
  email: 'admin@example.com',
  password: 'admin_password', // Ensure to hash passwords in production
  permissions: ['manage_users', 'manage_services'],
});

const generateCustomer = (): Partial<Customer> => ({
  first_name: 'CustomerFirstName',
  last_name: 'CustomerLastName',
  email: 'customer@example.com',
  password: 'customer_password', // Ensure to hash passwords in production
  loyalty_points: 100,
});

const generateServiceProvider = (): Partial<ServiceProvider> => ({
  first_name: 'ProviderFirstName',
  last_name: 'ProviderLastName',
  email: 'provider@example.com',
  password: 'provider_password', // Ensure to hash passwords in production
  business_name: 'Provider Business Name',
});

const generateService = (
  serviceProviderId: Types.ObjectId,
): Partial<Service> => ({
  service_name: 'Plumbing',
  service_attributes: {
    availability: '24/7',
    certification: 'Licensed',
  },
  base_price: 150,
  status: 'active',
  description: 'Professional plumbing services',
  category: 'Home Services',
  creation_time: new Date(),
  images: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
  service_provider_id: serviceProviderId, // Reference to the service provider
});

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get models
  const adminModel = app.get<Model<Admin>>(getModelToken(Admin.name));
  const customerModel = app.get<Model<Customer>>(getModelToken(Customer.name));
  const serviceProviderModel = app.get<Model<ServiceProvider>>(
    getModelToken(ServiceProvider.name),
  );
  const serviceModel = app.get<Model<Service>>(getModelToken(Service.name));

  // Clear existing data (optional)
  await Promise.all([
    adminModel.deleteMany({}),
    customerModel.deleteMany({}),
    serviceProviderModel.deleteMany({}),
    serviceModel.deleteMany({}),
  ]);

  // Create one admin
  const admin = await adminModel.create(generateAdmin());

  // Create one customer
  const customer = await customerModel.create(generateCustomer());

  // Create one service provider
  const serviceProvider = await serviceProviderModel.create(
    generateServiceProvider(),
  );

  // Create one service linked to the service provider
  const service = await serviceModel.create(
    generateService(serviceProvider._id as Types.ObjectId),
  );

  await serviceProviderModel.findByIdAndUpdate(serviceProvider._id, {
    $push: {
      services: service._id,
    },
  });

  console.log('Database seeded with:');
  console.log(`- Admin: ${admin.email}`);
  console.log(`- Customer: ${customer.email}`);
  console.log(`- Service Provider: ${serviceProvider.email}`);
  console.log(
    `- Service: ${service.service_name} linked to ${serviceProvider.business_name}`,
  );

  await app.close();
}

bootstrap();
