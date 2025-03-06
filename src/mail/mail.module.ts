import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const port = configService.get<number>('MAIL_PORT') || 587;
        const secure = port === 465; // true for 465, false for other ports

        return {
          transport: {
            host: configService.get('MAIL_HOST'),
            port: port,
            secure: secure,
            auth: {
              user: configService.get('MAIL_USER'),
              pass: configService.get('MAIL_PASSWORD'),
            },
            // Required for Gmail
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: `"${configService.get('MAIL_FROM_NAME')}" <${configService.get('MAIL_FROM_ADDRESS')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
          preview: configService.get('NODE_ENV') === 'development',
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
