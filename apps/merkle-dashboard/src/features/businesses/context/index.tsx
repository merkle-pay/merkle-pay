import React, { useEffect, useState } from 'react'
import { fetchBusinesses } from '@/queries/business'
import { logger } from '@/utils/logger'
import { Business } from '../data/schema'

interface BusinessesContextType {
  currentRow: Business | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Business | null>>
  businesses: Business[] | null
  isLoading: boolean
}

const BusinessesContext = React.createContext<BusinessesContextType | null>(
  null
)

interface Props {
  children: React.ReactNode
}

export default function BusinessesProvider({ children }: Props) {
  const [currentRow, setCurrentRow] = useState<Business | null>(null)
  const [businesses, setBusinesses] = useState<Business[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const { businesses } = await fetchBusinesses()
        setBusinesses(businesses)
      } catch (error) {
        logger(error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  return (
    <BusinessesContext
      value={{
        currentRow,
        setCurrentRow,
        businesses,
        isLoading,
      }}
    >
      {children}
    </BusinessesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBusinessesContext = () => {
  const businessesContext = React.useContext(BusinessesContext)

  if (!businessesContext) {
    throw new Error('useBusinesses has to be used within <BusinessesContext>')
  }

  return businessesContext
}
