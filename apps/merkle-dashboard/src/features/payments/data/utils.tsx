import {
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconExclamationCircle,
} from '@tabler/icons-react'

// !TODO: make sure it fits business needs
export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]

export const statuses = [
  {
    value: 'PENDING',
    label: 'Pending',
    icon: IconExclamationCircle,
  },
  {
    value: 'CONFIRMED',
    label: 'Confirmed',
    icon: IconCircle,
  },
  {
    value: 'FAILED',
    label: 'Failed',
    icon: IconCircleX,
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    icon: IconCircleX,
  },
  {
    value: 'FINALIZED',
    label: 'Finalized',
    icon: IconCircleCheck,
  },
]
