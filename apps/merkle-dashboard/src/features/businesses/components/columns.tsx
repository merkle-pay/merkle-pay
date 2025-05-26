import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Business } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Business>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'business_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Business Name' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px]'>{row.getValue('business_name')}</div>
    ),
    enableGrouping: true,
    enableMultiSort: true,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'blockchain',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Blockchain' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px]'>{row.getValue('blockchain')}</div>
    ),
    enableGrouping: true,
    enableMultiSort: true,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'wallets',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Wallets' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px]'>{row.getValue('wallets')}</div>
    ),
  },
  {
    accessorKey: 'tokens',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tokens' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('tokens')}</div>,
    enableGrouping: true,
    enableMultiSort: true,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px]'>
        {new Date(row.getValue('createdAt')).toLocaleString().replace(',', '')}
      </div>
    ),
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
