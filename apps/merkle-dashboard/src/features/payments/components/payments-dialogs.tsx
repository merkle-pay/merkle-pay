import { toast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePaymentsContext } from '../context/payments-context'
import { PaymentsImportDialog } from './payments-import-dialog'
import { PaymentsMutateDrawer } from './payments-mutate-drawer'

export function PaymentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePaymentsContext()
  return (
    <>
      <PaymentsMutateDrawer
        key='payment-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <PaymentsImportDialog
        key='payments-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <PaymentsMutateDrawer
            key={`payment-update-${currentRow.mpid}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='payment-archive'
            destructive
            open={open === 'archive'}
            onOpenChange={() => {
              setOpen('archive')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              toast({
                title: 'The following payment has been archived:',
                description: (
                  <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
                    <code className='text-white'>
                      {JSON.stringify(currentRow, null, 2)}
                    </code>
                  </pre>
                ),
              })
            }}
            className='max-w-md'
            title={`Archive this payment: ${currentRow.mpid} ?`}
            desc={
              <>
                You are about to archive a payment with the MPID{' '}
                <strong>{currentRow.mpid}</strong>. <br />
              </>
            }
            confirmText='Archive'
          />
        </>
      )}
    </>
  )
}
