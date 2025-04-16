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
    accessorKey: 'referencePublicKey',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reference Public Key' />
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className='w-[80px] cursor-pointer truncate'
              onClick={async () => {
                await navigator.clipboard.writeText(
                  row.getValue('referencePublicKey')
                )
                toast({
                  title: 'Reference Public Key copied to clipboard',
                })
              }}
            >
              {row.getValue('referencePublicKey')}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.getValue('referencePublicKey')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    enableSorting: false,
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('amount')}</div>,
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
  },
  {
    accessorKey: 'mpid',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='MPID' />
    ),
    cell: ({ row }) => {
      return (
        <div
          className='w-[80px] cursor-pointer'
          onClick={async () => {
            await navigator.clipboard.writeText(row.getValue('mpid'))
            toast({
              title: 'MPID copied to clipboard',
            })
          }}
        >
          {row.getValue('mpid')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
