import { useState } from "react";

import papaparse from "papaparse";
import warnOnce from "warn-once";

import {
  downloadInBrowser,
  pickDataProvider,
  useUserFriendlyName,
} from "@definitions";
import { useDataProvider, useMeta, useResource } from "@hooks";

import type {
  BaseRecord,
  CrudFilter,
  CrudSort,
  MetaQuery,
} from "../../contexts/data/types";
import type { MapDataFn } from "./types";

// Old options interface taken from export-to-csv-fix-source-map@0.2.1
// Kept here to ensure backward compatibility
export interface ExportOptions {
  filename?: string;
  fieldSeparator?: string;
  quoteStrings?: string;
  decimalSeparator?: string;
  showLabels?: boolean;
  showTitle?: boolean;
  title?: string;
  useTextFile?: boolean;
  useBom?: boolean;
  headers?: string[];
  useKeysAsHeaders?: boolean;
}

type UseExportOptionsType<
  TData extends BaseRecord = BaseRecord,
  TVariables = any,
> = {
  /**
   * Resource name for API data interactions
   * @default Resource name that it reads from route
   */
  resource?: string;
  /**
   * A mapping function that runs for every record. Mapped data will be included in the file contents
   */
  mapData?: MapDataFn<TData, TVariables>;
  /**
   *  Sorts records
   */
  sorters?: CrudSort[];
  /**
   *  Filters records
   */
  filters?: CrudFilter[];
  maxItemCount?: number;
  /**
   *  Requests to fetch data are made as batches by page size. By default, it is 20. Used for `getList` method of `DataProvider`
   */
  pageSize?: number;
  /**
   *  Used for exporting options
   *  @type [UnparseConfig](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/papaparse)
   */
  unparseConfig?: papaparse.UnparseConfig;
  /**
   *  Metadata query for `dataProvider`
   */
  meta?: MetaQuery;
  /**
   *  Metadata query for `dataProvider`
  /**
   * If there is more than one `dataProvider`, you should use the `dataProviderName` that you will use.
   */
  dataProviderName?: string;
  /**
   *  Callback to handle error events of this hook
   */
  onError?: (error: any) => void;
  /**
   *  Whether to generate download of the CSV in browser environments, defaults to true.
   */
  download?: boolean;
};

type UseExportReturnType = {
  isLoading: boolean;
  triggerExport: () => Promise<string | undefined>;
};

/**
 * `useExport` hook allows you to make your resources exportable.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/import-export/useExport} for more details.
 *
 * @typeParam TData - Result data of the query extends {@link https://refine.dev/docs/api-reference/core/interfaceReferences#baserecord `BaseRecord`}
 * @typeParam TVariables - Values for params.
 *
 */
export const useExport = <
  TData extends BaseRecord = BaseRecord,
  TVariables = any,
>({
  resource: resourceFromProps,
  sorters,
  filters,
  maxItemCount,
  pageSize = 20,
  mapData = (item) => item as any,
  unparseConfig,
  meta,
  dataProviderName,
  onError,
  download,
}: UseExportOptionsType<TData, TVariables> = {}): UseExportReturnType => {
  const [isLoading, setIsLoading] = useState(false);

  const dataProvider = useDataProvider();
  const getMeta = useMeta();
  const { resource, resources, identifier } = useResource(resourceFromProps);
  const getFriendlyName = useUserFriendlyName();

  const filename = `${getFriendlyName(
    identifier,
    "plural",
  )}-${new Date().toLocaleString()}`;

  const { getList } = dataProvider(
    pickDataProvider(identifier, dataProviderName, resources),
  );

  const combinedMeta = getMeta({
    resource,
    meta: meta,
  });

  const triggerExport = async () => {
    setIsLoading(true);

    let rawData: BaseRecord[] = [];

    let current = 1;
    let preparingData = true;
    while (preparingData) {
      try {
        const { data, total } = await getList<TData>({
          resource: resource?.name ?? "",
          filters,
          sorters,
          pagination: {
            current,
            pageSize,
            mode: "server",
          },
          meta: combinedMeta,
        });

        current++;

        rawData.push(...data);

        if (maxItemCount && rawData.length >= maxItemCount) {
          rawData = rawData.slice(0, maxItemCount);
          preparingData = false;
        }

        if (total === rawData.length) {
          preparingData = false;
        }
      } catch (error) {
        setIsLoading(false);
        preparingData = false;

        onError?.(error);

        return;
      }
    }

    const hasUnparseConfig =
      typeof unparseConfig !== "undefined" && unparseConfig !== null;

    const options: ExportOptions = {
      filename,
      useKeysAsHeaders: true,
      useBom: true, // original default
      title: "My Generated Report", // original default
      quoteStrings: '"', // original default
    };

    if (!hasUnparseConfig) {
      unparseConfig = {
        // useKeysAsHeaders takes priority over options.headers
        columns: options.useKeysAsHeaders ? undefined : options.headers,
        delimiter: options.fieldSeparator,
        header: options.showLabels || options.useKeysAsHeaders,
        quoteChar: options.quoteStrings,
        quotes: true,
      };
    } else {
      unparseConfig = {
        // Set to force quote for better compatibility
        quotes: true,
        ...unparseConfig,
      };
    }

    let csv = papaparse.unparse(rawData.map(mapData as any), unparseConfig);
    if (options.showTitle) {
      csv = `${options.title}\r\n\n${csv}`;
    }

    // Backward compatibility support for downloadInBrowser of the exported file, only works for browsers.
    if (typeof window !== "undefined" && csv.length > 0 && (download ?? true)) {
      const fileExtension = options.useTextFile ? ".txt" : ".csv";
      const fileType = `text/${
        options.useTextFile ? "plain" : "csv"
      };charset=utf8;`;
      const downloadFilename = `${(options.filename ?? "download").replace(
        / /g,
        "_",
      )}${fileExtension}`;

      downloadInBrowser(
        downloadFilename,
        `${options?.useBom ? "\ufeff" : ""}${csv}`,
        fileType,
      );
    }

    setIsLoading(false);
    return csv;
  };

  return {
    isLoading,
    triggerExport,
  };
};
