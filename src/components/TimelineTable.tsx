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
      cell: info => <span className="font-mono text-[#7A6F63] text-[10.5px]">{new Date(info.getValue()).toLocaleString()}</span>,
    }),
    columnHelper.accessor('event_type', {
      header: 'TYPE',
      cell: info => (
        <span className="font-sans font-medium text-[#2A2420] text-[11px]">
          {info.getValue().replace(/_/g, ' ')}
        </span>
      ),
    }),
    columnHelper.accessor('entity_id', {
      header: 'ENTITY',
      cell: info => <span className="font-mono text-[#C4622D] font-medium text-[11px]">{info.getValue()}</span>,
    }),
    columnHelper.accessor('counterparty_id', {
      header: 'COUNTERPARTY',
      cell: info => <span className="font-mono text-[#7A6F63] text-[10.5px]">{info.getValue() || '-'}</span>,
    }),
    columnHelper.accessor('amount', {
      header: 'AMOUNT',
      cell: info => (
        <span className="font-mono text-[#8C3D1A] font-semibold text-[11px]">
          {info.getValue() ? `₹${info.getValue()?.toLocaleString()}` : '-'}
        </span>
      ),
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
      <div className="h-8 border-b border-[#DDD5CA] bg-[#F3EDE4] flex items-center justify-between px-4 shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-[#7A6F63] font-semibold">Event Timeline</span>
        <span className="text-[9.5px] font-mono text-[#7A6F63]">{events.length} recorded events</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="sticky top-0 bg-[#F3EDE4] z-10 border-b border-[#DDD5CA]">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-3.5 py-2 font-sans font-semibold tracking-widest text-[#A89F93] uppercase cursor-pointer hover:text-[#2A2420] transition-colors"
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
                  className={`border-b border-[#DDD5CA]/50 cursor-pointer transition-colors group ${
                    isSelected ? 'bg-[#F3EDE4]/80' : 'hover:bg-[#EDE5D8]/50'
                  }`}
                  style={{
                    borderLeft: isSelected ? '3.5px solid #C4622D' : '3.5px solid transparent',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3.5 py-2">
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
