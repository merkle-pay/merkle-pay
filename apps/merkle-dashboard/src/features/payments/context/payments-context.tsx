import React, { useEffect, useState } from 'react'
import { fetchPayments } from '@/queries/payment'
import { logger } from '@/utils/logger'
import useDialogState from '@/hooks/use-dialog-state'
import { Payment } from '../data/schema'

type PaymentsDialogType = 'create' | 'update' | 'import' | 'export' | 'archive'

interface PaymentsContextType {
  open: PaymentsDialogType | null
  setOpen: (str: PaymentsDialogType | null) => void
  currentRow: Payment | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Payment | null>>
  payments: Payment[]
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  pageSize: number
  setPageSize: React.Dispatch<React.SetStateAction<number>>
  total: number
  isLoading: boolean
}

const PaymentsContext = React.createContext<PaymentsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function PaymentsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<PaymentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Payment | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const { payments, total } = await fetchPayments({
          page,
          pageSize,
        })
        setPayments(payments)
        setTotal(total)
      } catch (error) {
        logger(error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [page, pageSize])

  return (
    <PaymentsContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        payments,
        page,
        setPage,
        pageSize,
        setPageSize,
        total,
        isLoading,
      }}
    >
      {children}
    </PaymentsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePaymentsContext = () => {
  const paymentsContext = React.useContext(PaymentsContext)

  if (!paymentsContext) {
    throw new Error('usePayments has to be used within <PaymentsContext>')
  }

  return paymentsContext
}
