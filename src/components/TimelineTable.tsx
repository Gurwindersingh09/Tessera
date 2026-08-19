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
      cell: info => <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-muted)', fontSize: 10.5 }}>{new Date(info.getValue()).toLocaleString()}</span>,
    }),
    columnHelper.accessor('event_type', {
      header: 'TYPE',
      cell: info => (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: 'var(--color-text-primary)', fontSize: 11 }}>
          {info.getValue().replace(/_/g, ' ')}
        </span>
      ),
    }),
    columnHelper.accessor('entity_id', {
      header: 'ENTITY',
      cell: info => <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#C4622D', fontWeight: 500, fontSize: 11 }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('counterparty_id', {
      header: 'COUNTERPARTY',
      cell: info => <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-secondary)', fontSize: 10.5 }}>{info.getValue() || '-'}</span>,
    }),
    columnHelper.accessor('amount', {
      header: 'AMOUNT',
      cell: info => (
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#D4854A', fontWeight: 600, fontSize: 11 }}>
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
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg-surface)', color: 'var(--color-text-primary)' }}>
      <div 
        className="h-8 flex items-center justify-between px-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}
      >
        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Event Timeline</span>
        <span className="text-[9.5px] font-mono" style={{ color: 'var(--color-text-muted)' }}>{events.length} recorded events</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead 
            className="sticky top-0 z-10"
            style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}
          >
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-3.5 py-2 font-sans font-semibold tracking-widest uppercase cursor-pointer transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
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
                  className="cursor-pointer transition-colors group"
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: isSelected ? 'var(--color-bg-hover)' : 'transparent',
                    borderLeft: isSelected ? '3.5px solid #C4622D' : '3.5px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--color-bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
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
export default TimelineTable;
