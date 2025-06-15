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
        const mailConfig = configService.get('mail');
        const port = mailConfig.port;
        const secure = port === 465; 

        return {
          transport: {
            host: mailConfig.host,
            port: port,
            secure: secure,
            auth: {
              user: mailConfig.user,
              pass: mailConfig.password,
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: `"${mailConfig.fromName}" <${mailConfig.fromAddress}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
          // preview: configService.get('NODE_ENV') === 'development',
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
