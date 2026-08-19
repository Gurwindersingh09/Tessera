import React, { useMemo } from 'react';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { AnalyticsEvent } from '../types/schema';

export const TimelineTable: React.FC = () => {
  const { events, selectedEntityId, setSelectedEntityId } = useAnalyticsStore();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'timestamp', desc: true }]);

  const columnHelper = createColumnHelper<AnalyticsEvent>();

  const columns = useMemo(() => [
    columnHelper.accessor('timestamp', {
      header: 'TIMESTAMP',
      cell: info => <span className="font-mono text-[#7A6F63]">{new Date(info.getValue()).toLocaleString()}</span>,
    }),
    columnHelper.accessor('event_type', {
      header: 'TYPE',
      cell: info => <span className="font-sans font-medium text-[#2A2420]">{info.getValue().replace(/_/g, ' ')}</span>,
    }),
    columnHelper.accessor('entity_id', {
      header: 'ENTITY',
      cell: info => <span className="font-mono text-[#C4622D]">{info.getValue()}</span>,
    }),
    columnHelper.accessor('counterparty_id', {
      header: 'COUNTERPARTY',
      cell: info => <span className="font-mono text-[#7A6F63]">{info.getValue() || '-'}</span>,
    }),
    columnHelper.accessor('amount', {
      header: 'AMOUNT',
      cell: info => <span className="font-mono text-[#8C3D1A]">{info.getValue() ? `₹${info.getValue()?.toLocaleString()}` : '-'}</span>,
    }),
  ], [columnHelper]);

  const table = useReactTable({
    data: events,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="h-full flex flex-col bg-[#FAF6F0]">
      <div className="h-8 border-b border-[#DDD5CA] bg-[#F3EDE4] flex items-center px-4 shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-[#7A6F63] font-semibold">Event Timeline</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="sticky top-0 bg-[#F3EDE4] z-10 border-b border-[#DDD5CA]">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-4 py-2 font-sans font-semibold tracking-widest text-[#A89F93] uppercase cursor-pointer hover:text-[#2A2420] transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              const isSelected = row.original.entity_id === selectedEntityId || row.original.counterparty_id === selectedEntityId;
              
              return (
                <tr 
                  key={row.id} 
                  onClick={() => setSelectedEntityId(row.original.entity_id)}
                  className={`border-b border-[#DDD5CA]/50 cursor-pointer group hover:bg-[#EDE5D8] transition-colors ${isSelected ? 'bg-[#EDE5D8]' : ''}`}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td key={cell.id} className={`px-4 py-2 border-l-2 ${idx === 0 ? (isSelected ? 'border-l-[#C4622D]' : 'border-l-transparent group-hover:border-l-[#C4622D]') : 'border-l-transparent'}`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
