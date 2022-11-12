import { Center, Pagination, Table } from '@mantine/core';
import { PaginationController } from '~/hooks/usePagination';

export interface Props<T> {
   items: T[];
   isLoading?: boolean;
   header: () => React.ReactNode;
   rows: (item: T) => React.ReactNode;
   pagination: PaginationController;
}

const PaginatedTable = <T,>({ items, header, rows, pagination }: Props<T>) => {
   return (
      <>
         <Table>
            <thead>{header()}</thead>
            <tbody>{items.map(rows)}</tbody>
         </Table>
         <Center mt={'md'}>
            <Pagination
               page={pagination.data.page}
               total={pagination.pages}
               onChange={(page) => pagination.setPage(page)}
            />
            <br />
         </Center>
      </>
   );
};

export default PaginatedTable;
