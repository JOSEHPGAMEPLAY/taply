import { Logger } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MailService } from '../../mail/mail.service.js';
import { PublicService } from '../../public/public.service.js';

const publishedVersion = {
  id: 'version-id',
  config: { theme: 'modern' },
  buttons: [{ key: 'contact', label: 'Contact' }],
};

const pageRecord = {
  id: 'page-id',
  slug: 'public-slug',
  publishedVersionId: publishedVersion.id,
  business: {
    id: 'business-id',
    name: 'Public business',
    description: 'Public description',
    status: 'ACTIVE',
  },
  versions: [publishedVersion],
};

const publicResponse = {
  page: {
    id: pageRecord.id,
    slug: pageRecord.slug,
  },
  business: {
    id: pageRecord.business.id,
    name: pageRecord.business.name,
    description: pageRecord.business.description,
  },
  publishedVersion: {
    config: publishedVersion.config,
    buttons: publishedVersion.buttons,
  },
};

const findPage = vi.fn();
const findPageVersion = vi.fn();
const createAnalyticsEvent = vi.fn();

const prisma = {
  page: { findFirst: findPage },
  pageVersion: { findUnique: findPageVersion },
  analyticsEvent: { create: createAnalyticsEvent },
} as unknown as PrismaClient;

const mailService = {
  sendContactEmail: vi.fn(),
} as unknown as MailService;

describe('PublicService.getPublicPage', () => {
  let service: PublicService;

  beforeEach(() => {
    findPage.mockReset();
    findPageVersion.mockReset();
    createAnalyticsEvent.mockReset();

    findPage.mockResolvedValue(pageRecord);
    findPageVersion.mockResolvedValue(null);
    createAnalyticsEvent.mockResolvedValue({});

    service = new PublicService(prisma, mailService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devuelve los datos públicos con una lectura relacional y campos limitados', async () => {
    const response = await service.getPublicPage(pageRecord.slug);

    expect(response).toEqual(publicResponse);
    expect(findPage).toHaveBeenCalledWith({
      where: { slug: pageRecord.slug, status: 'PUBLISHED' },
      select: {
        id: true,
        slug: true,
        publishedVersionId: true,
        business: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
        },
        versions: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            config: true,
            buttons: true,
          },
        },
      },
    });
    expect(findPageVersion).not.toHaveBeenCalled();
    await vi.waitFor(() =>
      expect(createAnalyticsEvent).toHaveBeenCalledWith({
        data: { pageId: pageRecord.id, type: 'PAGE_VIEW' },
      }),
    );
  });

  it('consulta por ID si el puntero publicado no coincide con la relación', async () => {
    findPage.mockResolvedValue({ ...pageRecord, versions: [] });
    findPageVersion.mockResolvedValue(publishedVersion);

    const response = await service.getPublicPage(pageRecord.slug);

    expect(response).toEqual(publicResponse);
    expect(findPageVersion).toHaveBeenCalledWith({
      where: { id: publishedVersion.id },
      select: { id: true, config: true, buttons: true },
    });
  });

  it('no espera a que termine el tracking PAGE_VIEW', async () => {
    let resolveTracking!: (value: object) => void;
    const trackingPromise = new Promise<object>((resolve) => {
      resolveTracking = resolve;
    });
    createAnalyticsEvent.mockReturnValue(trackingPromise);

    const responsePromise = service.getPublicPage(pageRecord.slug);
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const timedOut = new Promise<{ timedOut: true }>((resolve) => {
      timeoutHandle = setTimeout(() => resolve({ timedOut: true }), 100);
    });
    const result = await Promise.race([
      responsePromise.then((response) => ({ response })),
      timedOut,
    ]);
    clearTimeout(timeoutHandle);

    resolveTracking({});
    const response = await responsePromise;

    expect(result).toEqual({ response });
    expect(response).toEqual(publicResponse);
  });

  it('mantiene la respuesta y registra el fallo del tracking PAGE_VIEW', async () => {
    const loggerError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    createAnalyticsEvent.mockRejectedValue(new Error('database unavailable'));

    await expect(service.getPublicPage(pageRecord.slug)).resolves.toEqual(publicResponse);
    await vi.waitFor(() =>
      expect(loggerError).toHaveBeenCalledWith(
        'Failed to record automatic PAGE_VIEW analytics event',
      ),
    );
  });
});