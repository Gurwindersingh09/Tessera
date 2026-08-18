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
      cell: info => <span className="font-mono text-slate-400">{new Date(info.getValue()).toLocaleString()}</span>,
    }),
    columnHelper.accessor('event_type', {
      header: 'TYPE',
      cell: info => <span className="font-sans font-medium text-slate-300">{info.getValue().replace(/_/g, ' ')}</span>,
    }),
    columnHelper.accessor('entity_id', {
      header: 'ENTITY',
      cell: info => <span className="font-mono text-neon-cyan">{info.getValue()}</span>,
    }),
    columnHelper.accessor('counterparty_id', {
      header: 'COUNTERPARTY',
      cell: info => <span className="font-mono text-slate-400">{info.getValue() || '-'}</span>,
    }),
    columnHelper.accessor('amount', {
      header: 'AMOUNT',
      cell: info => <span className="font-mono text-neon-amber">{info.getValue() ? `₹${info.getValue()?.toLocaleString()}` : '-'}</span>,
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
    <div className="h-full flex flex-col bg-[#090C15]">
      <div className="h-8 border-b border-slate-800 bg-slate-900/50 flex items-center px-4 shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Event Timeline</span>
      </div>
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="sticky top-0 bg-[#090C15] z-10 border-b border-slate-800">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-4 py-2 font-sans font-semibold tracking-widest text-slate-500 uppercase cursor-pointer hover:text-slate-300 transition-none"
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
                  className={`border-b border-slate-800/50 cursor-pointer transition-none group hover:bg-slate-800/30 ${isSelected ? 'bg-slate-800/50' : ''}`}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td key={cell.id} className={`px-4 py-2 border-l-2 ${idx === 0 ? (isSelected ? 'border-l-neon-cyan' : 'border-l-transparent group-hover:border-l-neon-cyan') : 'border-l-transparent'}`}>
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
