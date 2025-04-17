import { ColumnDef } from '@tanstack/react-table'
import { toast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Payment } from '../data/schema'
import { statuses } from '../data/utils'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Payment>[] = [
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
    accessorKey: 'orderId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order ID' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px]'>{row.getValue('orderId')}</div>
    ),
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
    accessorKey: 'token',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Token' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('token')}</div>,
    enableGrouping: true,
    enableMultiSort: true,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('amount')}</div>,
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center'>
          {status.icon && (
            <status.icon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
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
    accessorKey: 'recipient_address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Recipient Address' />
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className='w-[80px] cursor-pointer truncate'
              onClick={async () => {
                await navigator.clipboard.writeText(
                  row.getValue('recipient_address')
                )
                toast({
                  title: 'Recipient Address copied to clipboard',
                })
              }}
            >
              {row.getValue('recipient_address')}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.getValue('recipient_address')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    enableGrouping: true,
    enableMultiSort: true,
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
