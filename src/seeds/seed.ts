// src/seeds/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Admin } from '../users/schemas/admin.schema';
import { Customer } from '../users/schemas/customer.schema';
import { ServiceProvider } from '../users/schemas/service-provider.schema';
import { Service } from '../services/schemas/service.schema';
import { getModelToken } from '@nestjs/mongoose';
import { faker } from '@faker-js/faker';

// Helper functions using your schema structure
const generateAdmin = (): Partial<Admin> => ({
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  email: faker.internet.email(),
  password: `admin_${faker.internet.password()}`, // Add prefix for identification
  permissions: ['manage_users', 'manage_services'],
});

const generateCustomer = (): Partial<Customer> => ({
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  email: faker.internet.email(),
  password: `customer_${faker.internet.password()}`,
  loyalty_points: faker.number.int({ min: 0, max: 1000 }),
});

const generateServiceProvider = (): Partial<ServiceProvider> => ({
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  email: faker.internet.email(),
  password: `provider_${faker.internet.password()}`,
  business_name: faker.company.name(),
});

const generateService = (): Partial<Service> => {
  const serviceType = faker.helpers.arrayElement([
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Carpentry',
    'Landscaping',
  ]);

  return {
    service_name: serviceType,
    service_attributes: {
      availability: faker.helpers.arrayElement(['24/7', 'Weekdays', 'Emergency']),
      certification: faker.helpers.arrayElement(['Licensed', 'Certified', 'Verified']),
    },
    base_price: faker.number.int({ min: 50, max: 300 }),
    status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
    description: `Professional ${serviceType.toLowerCase()} services`,
    category: serviceType === 'Landscaping' ? 'Outdoor' : 'Home Services',
    creation_time: faker.date.past({ years: 1 }),
    images: Array.from({ length: 3 }, () => faker.image.url()),
  };
};

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get models
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const adminModel = app.get<Model<Admin>>(getModelToken(Admin.name));
  const customerModel = app.get<Model<Customer>>(getModelToken(Customer.name));
  const serviceProviderModel = app.get<Model<ServiceProvider>>(getModelToken(ServiceProvider.name));

  // Clear existing data
  await Promise.all([
    userModel.deleteMany({}),
    adminModel.deleteMany({}),
    customerModel.deleteMany({}),
    serviceProviderModel.deleteMany({}),
  ]);

  // Generate services first (if needed for relationships)
  const services = Array.from({ length: 10 }, generateService);

  // Create admins (5 admins)
  await adminModel.create(
    Array.from({ length: 5 }, generateAdmin)
  );

  // Create customers (20 customers)
  await customerModel.create(
    Array.from({ length: 20 }, generateCustomer)
  );

  // Create service providers with embedded services (15 providers)
  await serviceProviderModel.create(
    Array.from({ length: 15 }, () => ({
      ...generateServiceProvider(),
      services: Array.from({ length: 3 }, generateService), // 3 services per provider
    }))
  );

  console.log('Database seeded with:');
  console.log('- 5 admins\n- 20 customers\n- 15 service providers\n- 45 services');
  
  await app.close();
}

bootstrap();