import { TRPCClientErrorLike } from '@trpc/client';
import { DecorateProcedure, UseTRPCQueryOptions } from '@trpc/react/shared';
import {
   AnyQueryProcedure,
   inferProcedureInput,
   inferProcedureOutput,
} from '@trpc/server';

type GenericTableProps<
   TProcedure extends AnyQueryProcedure,
   TInput extends inferProcedureInput<TProcedure>,
   TPath extends string,
> = {
   query: DecorateProcedure<TProcedure, TPath>;
   input: TInput;
   queryOptions: UseTRPCQueryOptions<
      TPath,
      inferProcedureInput<TProcedure>,
      inferProcedureOutput<TProcedure>,
      inferProcedureOutput<TProcedure>,
      TRPCClientErrorLike<TProcedure>
   >;
   rows: (
      data: inferProcedureOutput<TProcedure> | undefined,
   ) => React.ReactNode;
};

const GenericTable = <
   TProcedure extends AnyQueryProcedure,
   TInput extends { limit: number } & inferProcedureInput<TProcedure>,
   TPath extends string,
>({
   query,
   input,
   queryOptions,
   rows,
}: GenericTableProps<TProcedure, TInput, TPath>) => {
   const { data } = query.useQuery(input, queryOptions);
   return <div>{rows(data)}</div>;
};

export default GenericTable;
