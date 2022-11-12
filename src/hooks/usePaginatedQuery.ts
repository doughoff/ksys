export interface Pagination {
   page: number;
   pageSize: number;
}

export const usePaginatedQuery = ({
   fetcher,
}: {
   fetcher: (args: { pagination: Pagination }) => void;
}) => {
   const page = 1;
   const pageSize = 10;

   return () => fetcher({ pagination: { page, pageSize } });
};
