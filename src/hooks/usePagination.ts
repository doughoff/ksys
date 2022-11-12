import React from 'react';

export interface PaginationController {
   pages: number;
   setPage: (page: number) => void;
   setPageSize: (pageSize: number) => void;
   setTotal: (total: number) => void;
   data: {
      page: number;
      pageSize: number;
   };
}

export const usePagination = (
   initialTotal?: number,
   initialPage?: number,
): PaginationController => {
   const [page, setPage] = React.useState(initialPage ?? 1);
   const [pageSize, setPageSize] = React.useState(10);
   const [pages, setPages] = React.useState(0);
   const [total, setTotal] = React.useState(initialTotal ?? 0);

   React.useEffect(() => {
      const pages = Math.ceil(total / pageSize);
      setPages(pages);
      setPage(Math.min(page, pages) || 1);
      console.log({
         page,
         pageSize,
         pages,
         total,
      });
   }, [total, pageSize, page]);

   return {
      pages,
      setPage,
      setPageSize,
      setTotal,
      data: {
         page,
         pageSize,
      },
   };
};
