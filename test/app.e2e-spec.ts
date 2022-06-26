import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import * as lodash from 'lodash';

describe('App e2e', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  const baseUrl = 'http://localhost:3333';
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleRef.createNestApplication();

    //permit validation on every request
    // Ensure to add this validation before initialization
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // remove extra values that I don't need
      }),
    );

    await app.init();
    // start the server PS: this is not required with supertest, but pactum needs this
    await app.listen(3333);
    prismaService = app.get(PrismaService); // get prisma service
    await prismaService.cleanDb();
  });

  afterAll(() => {
    app.close();
  });
  describe('Auth', () => {
    const authDto: AuthDto = {
      email: 'sampleemail@mail.com',
      password: 'ideealPassword',
    };

    describe('SignUp', () => {
      it('should throw 400 for empty email', () => {
        const noEmailDto = lodash.omit(authDto, ['email']);
        return pactum
          .spec()
          .post(`${baseUrl}/auth/signup`)
          .withBody(noEmailDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw 400 for empty password', () => {
        const noPassDto = lodash.omit(authDto, ['password']);
        return pactum
          .spec()
          .post(`${baseUrl}/auth/signup`)
          .withBody(noPassDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/auth/signup`)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Should signup if required email and password is provided', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/auth/signup`)
          .withBody(authDto)
          .expectStatus(HttpStatus.CREATED);
      });
    });
    describe('SignIn', () => {
      it('should throw 400 for empty email', () => {
        const noEmailDto = lodash.omit(authDto, ['email']);
        return pactum
          .spec()
          .post(`${baseUrl}/auth/signin`)
          .withBody(noEmailDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw 400 for empty password', () => {
        const noPassDto = lodash.omit(authDto, ['password']);
        return pactum
          .spec()
          .post(`${baseUrl}/auth/signin`)
          .withBody(noPassDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/auth/signin`)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/auth/signin`)
          .withBody(authDto)
          .expectStatus(HttpStatus.OK)
          .stores('access_token', 'token');
      });
    });
  });
  describe('User', () => {
    describe('Get Current  User', () => {
      it('should get current user with valid token', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/users/me`)
          .withHeaders({ Authorization: 'Bearer $S{access_token}' }) // not $S not ${}, '' not  ``
          .expectStatus(HttpStatus.OK);
      });
      it('should return 401 for invalid token', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/users/me`)
          .withHeaders({ Authorization: 'Bearer InvalidTokenHere' }) // not $S not ${}, '' not  ``
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
      it('should return 401 for missing Authorization header', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/users/me`)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
    describe('Edit User', () => {
      it('should edit current user with valid token', () => {
        const update = { firstName: 'John ', lastName: 'Doe' };
        return pactum
          .spec()
          .patch(`${baseUrl}/users`)
          .withHeaders({ Authorization: 'Bearer $S{access_token}' }) // not $S not ${}, '' not  ``
          .withBody(update)
          .expectStatus(HttpStatus.OK)
          .expect((ctx) => {
            const returnedData = lodash.pick(ctx.res.body, [
              'firstName',
              'lastName',
            ]);
            expect(returnedData).toEqual(update);
          });
      });
    });
  });
  describe('Bookmarks', () => {
    const bookmark = {
      title: 'Bookmark One',
      description: 'This bookmarks is amazing.',
      link: 'https://google.com',
    };
    let bookmarkId: number;
    describe('Get Bookmarks', () => {
      it(' should get bookmarks', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/bookmarks`)
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .expectStatus(HttpStatus.OK)
          .expectBody({ bookmarks: [] });
      });
    });
    describe('Create Bookmarks', () => {
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/bookmarks`)
          .withBody(bookmark)
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .expectStatus(HttpStatus.CREATED)
          .stores('bookmarkId', 'id')
          .expect((ctx) => (bookmarkId = ctx.res.body.id));
      });
    });
    describe('Get Bookmark by Id', () => {
      it('should get bookmark', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/bookmarks/$S{bookmarkId}`)
          .withHeaders('Authorization', `Bearer $S{access_token}`)
          .expectStatus(HttpStatus.OK)
          .expect((ctx) => expect(ctx.res.body.id).toBe(bookmarkId));
      });
    });
    describe('Edit Bookmarks', () => {
      const editBookmark = {
        title: 'Edited Bookmark',
        description: 'Description is modified',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch(`${baseUrl}/bookmarks/$S{bookmarkId}`)
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .withBody(editBookmark)
          .expectStatus(HttpStatus.OK)
          .expect((ctx) => {
            const updatedFields = lodash.pick(ctx.res.body, [
              'title',
              'description',
            ]);
            expect(updatedFields).toEqual(editBookmark);
          });
      });
    });
    describe('Delete Bookmark by Id', () => {
      it('should delete existing bookmark', () => {
        return pactum
          .spec()
          .delete(`${baseUrl}/bookmarks/$S{bookmarkId}`)
          .withHeaders('Authorization', 'Bearer $S{access_token}')
          .expectStatus(HttpStatus.OK)
          .expect((ctx) => ctx.res.body.id === bookmarkId);
      });
    });
  });
});
