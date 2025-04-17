import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconExternalLink, IconArchive } from '@tabler/icons-react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePaymentsContext } from '../context/payments-context'
import { paymentSchema, Payment } from '../data/schema'
import { labels } from '../data/utils'

interface DataTableRowActionsProps {
  row: Row<Payment>
}

const checkOnChainStatus = (payment: Payment) => {
  toast({
    title: 'Status Check',
    description: `Checking status for ${payment.mpid} (Not implemented yet).`,
  })
}

const getExplorerUrl = (payment: Payment): string | null => {
  const blockchain = payment.blockchain.toLowerCase()
  const txId = payment.txId

  if (!txId) return null

  switch (blockchain) {
    case 'solana':
      return `https://solscan.io/tx/${txId}`
    case 'ethereum':
    case 'polygon':
    case 'base':
      return `https://etherscan.io/tx/${txId}`
    default:
      return null
  }
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const payment = paymentSchema.parse(row.original) as Payment

  const { setOpen, setCurrentRow } = usePaymentsContext()

  const explorerUrl = getExplorerUrl(payment)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {explorerUrl && (
          <DropdownMenuItem onClick={() => window.open(explorerUrl, '_blank')}>
            {`View on ${payment.blockchain ?? ''} explorer`}
            <DropdownMenuShortcut>
              <IconExternalLink size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => checkOnChainStatus(payment)}>
          Check Status
        </DropdownMenuItem>
        <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={payment.status}>
              {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-red-600 focus:text-red-600'
          onClick={() => {
            setCurrentRow(payment)
            setOpen('archive')
          }}
        >
          Archive
          <DropdownMenuShortcut>
            <IconArchive size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
