import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AdminShell, DrawerLayout, StackLayout } from '@lumia-ui/layout';
import { DetailBlock, FormBlock, ListBlock } from '../blocks/blocks';
import { PageErrorWidget } from '../components/PageErrorWidget';
import { BlockErrorWidget } from '../components/BlockErrorWidget';
import type {
  BlockSchema,
  DataFetcher,
  DataQueryContext,
  DataSourceResult,
  PageSchema,
  ResourceConfig,
  ResourcePageRefs,
  ResourceScreen,
  DetailBlockProps,
  FormBlockProps,
  ListBlockProps,
} from '../index';
import {
  type ConfigError,
  validatePageConfig,
  validateResourceConfig,
  validateDataSourceResult,
  validateBlock,
} from '../validation';

type RendererState =
  | { status: 'loading' }
  | { status: 'forbidden' }
  | { status: 'error'; message: string }
  | { status: 'validation-error'; error: ConfigError }
  | {
      status: 'ready';
      resource: ResourceConfig;
      page: PageSchema;
      dataSources: Record<string, DataSourceResult>;
    };

const resolvePageId = (
  pages: ResourcePageRefs | undefined,
  screen: ResourceScreen,
) => {
  if (!pages) return undefined;

  switch (screen) {
    case 'list':
      return pages.list;
    case 'detail':
      return pages.detail;
    case 'create':
      return pages.create;
    case 'update':
      return pages.update ?? pages.edit;
    default:
      return undefined;
  }
};

const collectDataSourceResults = async (
  page: PageSchema,
  fetcher: DataFetcher,
  context: DataQueryContext,
) => {
  if (!fetcher.getDataSource) {
    return {};
  }

  const ids = Array.from(
    new Set(
      page.blocks
        .map((block) => block.dataSourceId)
        .filter(Boolean) as string[],
    ),
  );

  const results = await Promise.all(
    ids.map(async (id) => {
      const data = await fetcher.getDataSource?.(id, context);
      if (!data) {
        return [id, {}] as const;
      }
      const validation = validateDataSourceResult(data, id);
      if (!validation.success) {
        // Log validation failure but continue with empty data
        return [id, {}] as const;
      }
      return [id, validation.data] as const;
    }),
  );

  return results.reduce<Record<string, DataSourceResult>>((acc, [id, data]) => {
    acc[id] = data;
    return acc;
  }, {});
};

const buildPlacementStyle = (
  blockId: BlockSchema['id'],
  grid: PageSchema['grid'],
): CSSProperties | undefined => {
  if (!grid?.placements?.length) {
    return undefined;
  }

  const placement = grid.placements.find((entry) => entry.blockId === blockId);
  if (!placement) {
    return undefined;
  }

  const style: CSSProperties = {};
  if (placement.column) {
    const span = placement.columnSpan ?? 1;
    style.gridColumn = `${placement.column} / span ${span}`;
  }
  if (placement.row) {
    const span = placement.rowSpan ?? 1;
    style.gridRow = `${placement.row} / span ${span}`;
  }

  return style;
};

const renderBlockContent = (
  block: BlockSchema,
  resource: ResourceConfig,
  screen: ResourceScreen,
  dataSources: Record<string, DataSourceResult>,
): ReactNode => {
  const baseProps = block.props ?? {};
  const dataSource = block.dataSourceId
    ? dataSources[block.dataSourceId]
    : undefined;

  if (block.kind === 'table') {
    const props = baseProps as Partial<ListBlockProps>;
    const listProps: ListBlockProps = {
      ...props,
      data: props.data ?? dataSource?.records ?? [],
      columns: props.columns ?? [],
    };

    return <ListBlock {...listProps} />;
  }

  if (block.kind === 'detail') {
    const props = baseProps as Partial<DetailBlockProps>;
    const detailProps: DetailBlockProps = {
      ...props,
      record: props.record ?? dataSource?.record ?? {},
      fields: props.fields ?? [],
    };

    return <DetailBlock {...detailProps} />;
  }

  if (block.kind === 'form') {
    const props = baseProps as Partial<FormBlockProps>;
    const mode: FormBlockProps['mode'] =
      props.mode ?? (screen === 'update' ? 'update' : 'create');
    const formProps: FormBlockProps = {
      ...props,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resource: (props.resource ?? resource) as any,
      mode,
      initialValues:
        props.initialValues ??
        (dataSource?.initialValues as FormBlockProps['initialValues']),
    };

    return <FormBlock {...formProps} />;
  }

  return null;
};

/**
 * Validates and renders a single block.
 * Returns BlockErrorWidget for invalid blocks, allowing other blocks to render normally.
 */
const renderBlock = (
  block: unknown,
  blockIndex: number,
  resource: ResourceConfig,
  screen: ResourceScreen,
  dataSources: Record<string, DataSourceResult>,
): ReactNode => {
  // Validate the block before rendering
  const fallbackId = `block-${blockIndex}`;
  const blockId =
    typeof block === 'object' && block !== null && 'id' in block
      ? String((block as { id: unknown }).id)
      : fallbackId;

  const validation = validateBlock(block, blockId);

  if (!validation.success) {
    // Return BlockErrorWidget for invalid block
    const blockKind =
      typeof block === 'object' && block !== null && 'kind' in block
        ? String((block as { kind: unknown }).kind)
        : undefined;

    return <BlockErrorWidget blockId={blockId} blockKind={blockKind} />;
  }

  return renderBlockContent(validation.data, resource, screen, dataSources);
};

const renderBlocks = (
  page: PageSchema,
  resource: ResourceConfig,
  screen: ResourceScreen,
  dataSources: Record<string, DataSourceResult>,
) => {
  const rendered = page.blocks.map((block, index) => {
    const child = renderBlock(block, index, resource, screen, dataSources);
    if (!child) return null;

    // Use block.id if available, fallback to index-based key
    const blockId =
      typeof block === 'object' && block !== null && 'id' in block
        ? String((block as { id: unknown }).id)
        : `block-${index}`;

    return (
      <div
        key={blockId}
        data-block-id={blockId}
        style={buildPlacementStyle(blockId, page.grid)}
      >
        {child}
      </div>
    );
  });

  if (page.grid) {
    const columns = Math.max(page.grid.columns ?? 1, 1);
    const gap = page.grid.gap ?? 16;

    return (
      <div
        data-slot="resource-blocks"
        className="grid"
        style={{
          gap: `${gap}px`,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {rendered}
      </div>
    );
  }

  return (
    <div data-slot="resource-blocks" className="flex flex-col gap-4">
      {rendered}
    </div>
  );
};

export type ResourcePageRendererProps = {
  resourceName: string;
  screen: ResourceScreen;
  params?: Record<string, string>;
  fetcher: DataFetcher;
  permissions?: string[];
};

export function ResourcePageRenderer({
  resourceName,
  screen,
  params,
  fetcher,
  permissions,
}: ResourcePageRendererProps) {
  const [state, setState] = useState<RendererState>({ status: 'loading' });
  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);
  const permissionsKey = useMemo(
    () => (permissions ?? []).join('|'),
    [permissions],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState({ status: 'loading' });

      try {
        const resource = await fetcher.getResourceConfig(resourceName);
        if (!resource) {
          if (!cancelled) {
            setState({
              status: 'error',
              message: `Resource '${resourceName}' was not found`,
            });
          }
          return;
        }

        // Validate resource config
        const resourceValidation = validateResourceConfig(
          resource,
          resourceName,
        );
        if (!resourceValidation.success) {
          if (!cancelled) {
            setState({
              status: 'validation-error',
              error: resourceValidation.error,
            });
          }
          return;
        }

        const pageId = resolvePageId(resource.pages, screen);
        if (!pageId) {
          if (!cancelled) {
            setState({
              status: 'error',
              message: `No page configured for ${screen}`,
            });
          }
          return;
        }

        const page = await fetcher.getPageSchema(pageId);
        if (!page) {
          if (!cancelled) {
            setState({
              status: 'error',
              message: `Page '${pageId}' was not found`,
            });
          }
          return;
        }

        // Validate page config
        const pageValidation = validatePageConfig(page, pageId);
        if (!pageValidation.success) {
          if (!cancelled) {
            setState({
              status: 'validation-error',
              error: pageValidation.error,
            });
          }
          return;
        }
        const validatedPage = pageValidation.data as PageSchema;

        const context: DataQueryContext = {
          resource,
          screen,
          params,
          permissions,
        };
        const allowed = await fetcher.canAccess?.(context);
        if (allowed === false) {
          if (!cancelled) {
            setState({ status: 'forbidden' });
          }
          return;
        }

        const dataSources = await collectDataSourceResults(
          validatedPage,
          fetcher,
          {
            resource,
            screen,
            params,
            permissions,
          },
        );

        if (!cancelled) {
          setState({
            status: 'ready',
            resource,
            page: validatedPage,
            dataSources,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Failed to load page',
          });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetcher, paramsKey, permissionsKey, resourceName, screen]);

  if (state.status === 'loading') {
    return null;
  }

  if (state.status === 'forbidden') {
    return (
      <div role="alert" className="text-sm text-muted-foreground ">
        You do not have access to this resource.
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className="text-sm text-destructive">
        {state.message}
      </div>
    );
  }

  if (state.status === 'validation-error') {
    return (
      <PageErrorWidget
        error={state.error as Parameters<typeof PageErrorWidget>[0]['error']}
      />
    );
  }

  const content = renderBlocks(
    state.page,
    state.resource,
    screen,
    state.dataSources,
  );

  if (state.page.layout === 'admin-shell') {
    const header: ReactNode = (
      <div className="flex w-full items-center justify-between">
        <h1 className="text-base font-semibold leading-6 tracking-tight">
          {state.resource.id}
        </h1>
      </div>
    );

    const sidebar: ReactNode = (
      <div className="flex flex-col gap-2 text-sm text-muted-foreground ">
        <span className="font-semibold text-foreground">Resources</span>
        <span>{state.resource.id}</span>
      </div>
    );

    return (
      <AdminShell header={header} sidebar={sidebar}>
        <div className="p-6">{content}</div>
      </AdminShell>
    );
  }

  if (state.page.layout === 'drawer') {
    return (
      <DrawerLayout
        isOpen
        onClose={() => undefined}
        className="text-foreground"
      >
        {content}
      </DrawerLayout>
    );
  }

  return <StackLayout title={state.resource.id}>{content}</StackLayout>;
}
