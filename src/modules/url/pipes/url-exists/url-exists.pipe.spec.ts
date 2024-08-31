import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UrlExistsPipe } from './url-exists.pipe';
import { UrlService } from '../../url.service';
import { Test, TestingModule } from '@nestjs/testing';
import { generateUrlPayload, uid } from '../../__tests__/test-utils';
import { NotFoundException } from '@nestjs/common';

describe('UrlExistsPipe', () => {
  let urlExistsPipe: UrlExistsPipe;
  let urlService: DeepMocked<UrlService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UrlService,
          useValue: createMock<UrlService>(),
        },
      ],
    }).compile();

    urlService = module.get(UrlService);
    urlExistsPipe = new UrlExistsPipe(urlService);
  });

  it(`should return the URL when it exists`, async () => {
    // Arrange
    const payload = generateUrlPayload({});
    urlService.findOne.mockResolvedValueOnce(payload);

    // Act
    const result = await urlExistsPipe.transform(uid);

    // Assert
    expect(result).toEqual(payload);
  });

  it(`should throw a NotFoundException when the URL does not exist`, async () => {
    // Arrange
    urlService.findOne.mockResolvedValueOnce(null);

    // Act
    const result = urlExistsPipe.transform(`invalid-random-uid`);

    // Assert
    expect(result).rejects.toThrow(NotFoundException);
  });
});
