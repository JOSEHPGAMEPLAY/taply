import { PagesService } from '../../pages/pages.service.js';
import { vi } from 'vitest';

describe('PagesService template changes', () => {
  const pageId = 'page-1';
  const businessId = 'business-1';
  let prisma: any;
  let accessControl: any;
  let tx: any;
  let service: PagesService;

  beforeEach(() => {
    tx = {
      pageVersion: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'draft-1',
          config: { template: { bgGradient: 'old-gradient' }, content: { title: 'Keep me' } },
          buttons: [{ key: 'contact', label: 'Contact', url: 'https://example.com' }],
        }),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue(undefined),
      },
      page: {
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: pageId, templateId: 'template-2' }),
      },
    };
    prisma = {
      page: {
        findUnique: vi.fn().mockResolvedValue({
          id: pageId,
          businessId,
          templateId: 'template-1',
          publishedVersionId: 'published-1',
          status: 'PUBLISHED',
        }),
        update: vi.fn(),
      },
      template: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'template-2',
          config: { template: { bgGradient: 'new-gradient', buttonStyle: 'pill' } },
        }),
      },
      $transaction: vi.fn((callback: (transaction: any) => unknown) => callback(tx)),
    };
    accessControl = {
      requireBusinessRole: vi.fn().mockResolvedValue('OWNER'),
    };
    service = new PagesService(prisma, accessControl);
  });

  it('changes only the draft template config and preserves content and buttons', async () => {
    await service.update(businessId, pageId, { templateId: 'template-2' }, { userId: 'owner-1', role: 'USER' });

    expect(tx.pageVersion.update).toHaveBeenCalledWith({
      where: { id: 'draft-1' },
      data: {
        config: {
          template: { bgGradient: 'new-gradient', buttonStyle: 'pill' },
          content: { title: 'Keep me' },
        },
      },
    });
    expect(tx.pageVersion.create).not.toHaveBeenCalled();
    expect(tx.page.update).toHaveBeenCalledWith({ where: { id: pageId }, data: { templateId: 'template-2' } });
    expect(tx.pageVersion.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'published-1' } }),
    );
  });

  it('removes a template only from the draft when templateId is null', async () => {
    await service.update(businessId, pageId, { templateId: null }, { userId: 'owner-1', role: 'USER' });

    expect(tx.pageVersion.update).toHaveBeenCalledWith({
      where: { id: 'draft-1' },
      data: { config: { content: { title: 'Keep me' } } },
    });
    expect(tx.page.update).toHaveBeenCalledWith({ where: { id: pageId }, data: { templateId: null } });
  });

  it('adapts the legacy template config stored by the original seed', async () => {
    prisma.template.findUnique.mockResolvedValue({
      id: 'template-legacy',
      config: { backgroundColor: '#ffffff', accentColor: '#123456', layout: 'card' },
    });

    await service.update(businessId, pageId, { templateId: 'template-legacy' }, { userId: 'owner-1', role: 'USER' });

    expect(tx.pageVersion.update).toHaveBeenCalledWith({
      where: { id: 'draft-1' },
      data: {
        config: {
          template: { bgColor: '#ffffff', primaryColor: '#123456' },
          content: { title: 'Keep me' },
        },
      },
    });
  });

  it('creates a draft from the published snapshot before switching templates', async () => {
    tx.pageVersion.findFirst.mockResolvedValueOnce(null);
    tx.pageVersion.findUnique = vi.fn().mockResolvedValue({
      id: 'published-1',
      config: { template: { bgGradient: 'published-gradient' }, content: { title: 'Published title' } },
      buttons: [{ key: 'menu', label: 'Menu', url: 'https://example.com/menu' }],
    });
    tx.pageVersion.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'draft-created',
      ...data,
    }));

    await service.update(businessId, pageId, { templateId: 'template-2' }, { userId: 'owner-1', role: 'USER' });

    expect(tx.pageVersion.create).toHaveBeenCalledWith({
      data: {
        pageId,
        status: 'DRAFT',
        config: { template: { bgGradient: 'published-gradient' }, content: { title: 'Published title' } },
        buttons: [{ key: 'menu', label: 'Menu', url: 'https://example.com/menu' }],
      },
    });
    expect(tx.pageVersion.update).toHaveBeenCalledWith({
      where: { id: 'draft-created' },
      data: {
        config: {
          template: { bgGradient: 'new-gradient', buttonStyle: 'pill' },
          content: { title: 'Published title' },
        },
      },
    });
  });

  it('publishes the saved version snapshot without rereading the mutable template', async () => {
    const publishedPage = {
      id: pageId,
      businessId,
      status: 'PUBLISHED',
      publishedVersionId: 'published-1',
    };
    prisma.page.findUnique.mockResolvedValue(publishedPage);
    tx.page.findUnique.mockResolvedValue(publishedPage);
    tx.pageVersion.findFirst.mockResolvedValue({ id: 'draft-1', status: 'DRAFT' });

    await service.publish(businessId, pageId, { userId: 'owner-1', role: 'USER' });

    expect(prisma.template.findUnique).not.toHaveBeenCalled();
    expect(tx.pageVersion.update).toHaveBeenCalledWith({
      where: { id: 'draft-1' },
      data: { status: 'PUBLISHED' },
    });
  });
});