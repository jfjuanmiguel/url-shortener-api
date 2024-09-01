import { app } from '../../../test/setup';
import { DatabaseService } from '../../database/database.service';
import { UrlService } from './url.service';
import { createManyUrls } from './__tests__/test-utils';
import { ConfigService } from '@nestjs/config';

describe(`UrlService Integration Tests`, () => {
  let urlService: UrlService;
  let databaseService: DatabaseService;
  let configService: ConfigService;
  let host: string;

  beforeAll(async () => {
    databaseService = app.get(DatabaseService);
    urlService = app.get(UrlService);
    configService = app.get(ConfigService);
    host = configService.getOrThrow(`host`);
  });

  describe(`create`, () => {
    it(`should persist and return the url`, async () => {
      const payload = {
        title: `My special link`,
        redirect: `https://jmez.dev`,
      };

      const url = await urlService.create(payload);
      const persistedUrl = await databaseService.url.findUnique({
        where: {
          url: url.url,
        },
      });

      expect(url).toEqual(persistedUrl);
    });
  });

  describe(`findAll`, () => {
    it(`should return empty array when no urls exist in database`, async () => {
      const response = await urlService.findAll({});

      expect(response.data).toEqual([]);
    });

    it(`should return array of persisted urls`, async () => {
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });
      const urls = await databaseService.url.findMany({});

      const response = await urlService.findAll({});

      expect(response.data).toEqual(urls);
    });

    it(`should paginate results and show 1st page`, async () => {
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });
      const totalCount = await databaseService.url.count();
      const limit = 1;
      const page = 1;

      const response = await urlService.findAll({ page, limit });

      expect(response.meta).toEqual({
        totalCount,
        currentPage: page,
        perPage: limit,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it(`should paginate results and show middle page`, async () => {
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });
      const totalCount = await databaseService.url.count();
      const limit = 1;
      const page = 2;

      const response = await urlService.findAll({ page, limit });

      expect(response.meta).toEqual({
        totalCount,
        currentPage: page,
        perPage: limit,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it(`should paginate results and show last page`, async () => {
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });
      const totalCount = await databaseService.url.count();
      const limit = 1;
      const page = 3;

      const response = await urlService.findAll({ page, limit });

      expect(response.meta).toEqual({
        totalCount,
        currentPage: page,
        perPage: limit,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });
  });

  describe(`update`, () => {
    it(`should update and return respective url`, async () => {
      await databaseService.url.create({
        data: {
          id: 1,
          title: `My special link`,
          redirect: `https://jmez.dev`,
          url: `${host}/123456`,
        },
      });
      const url = await urlService.update(1, { title: `Updated title` });
      const updatedPersistedUrl = await databaseService.url.findUnique({
        where: { id: 1 },
      });

      expect(url).toEqual(updatedPersistedUrl);
    });

    it(`should throw error when url does not exist`, async () => {
      const updateUrl = urlService.update(1, { title: `Updated title` });

      await expect(updateUrl).rejects.toThrow();
    });
  });

  describe(`remove`, () => {
    it(`should remove and return respective url`, async () => {
      const persistedUrl = await databaseService.url.create({
        data: {
          id: 1,
          title: `My special link`,
          redirect: `https://jmez.dev`,
          url: `${host}/123456`,
        },
      });
      const url = await urlService.remove(1);
      const removedPersistedUrl = await databaseService.url.findUnique({
        where: { id: 1 },
      });

      expect(url).toEqual(persistedUrl);
      expect(removedPersistedUrl).toBeNull();
    });

    it(`should throw error when url does not exist`, async () => {
      const removeUrl = urlService.remove(1);

      await expect(removeUrl).rejects.toThrow();
    });
  });
});
