import { useNavigate } from '@tanstack/react-router'
import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export function PrimaryButtons() {
  const navigate = useNavigate()
  return (
    <div className='flex gap-2'>
      <Button
        className='cursor-pointer space-x-1'
        onClick={() => {
          navigate({ to: '/settings/create-business' })
        }}
      >
        <span>Create</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
