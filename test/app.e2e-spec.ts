import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';

describe('App e2e', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleRef.createNestApplication();
    await app.init();

    //permit validation on every request
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // remove extra values that I don't need
      }),
    );
    prismaService = app.get(PrismaService); // get prisma service
    await prismaService.cleanDb();
  });

  afterAll(() => {
    app.close();
  });
  describe('Auth', () => {
    describe('SignUp', () => {
      it.todo('Should signup');
    });
    describe('SignIn', () => {});
  });
  describe('User', () => {
    describe('Get Current  User', () => {});
    describe('Edit User', () => {});
  });
  describe('Bookmarks', () => {
    describe('Get Bookmarks', () => {});
    describe('Create Bookmarks', () => {});
    describe('Get Bookmark by Id', () => {});
    describe('Edit Bookmarks', () => {});
    describe('Delete Bookmark by Id', () => {});
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
// import { AppModule } from './../src/app.module';

// describe('AppController (e2e)', () => {
//   let app: INestApplication;

//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     await app.init();
//   });

//   it('/ (GET)', () => {
//     return request(app.getHttpServer())
//       .get('/')
//       .expect(200)
//       .expect('Hello World!');
//   });
// });
