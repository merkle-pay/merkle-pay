import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconExclamationCircle,
} from '@tabler/icons-react'

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

export const priorities = [
  {
    label: 'Low',
    value: 'low',
    icon: IconArrowDown,
  },
  {
    label: 'Medium',
    value: 'medium',
    icon: IconArrowRight,
  },
  {
    label: 'High',
    value: 'high',
    icon: IconArrowUp,
  },
]
