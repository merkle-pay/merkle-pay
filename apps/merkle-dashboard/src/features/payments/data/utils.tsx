import { FaClock, FaCheck, FaTimes, FaBan, FaLock } from 'react-icons/fa'
import { RiMoneyDollarCircleFill } from 'react-icons/ri'
import { SiSolana, SiEthereum, SiBitcoin, SiTether } from 'react-icons/si'

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
    icon: FaClock,
  },
  {
    value: 'CONFIRMED',
    label: 'Confirmed',
    icon: FaCheck,
  },
  {
    value: 'FAILED',
    label: 'Failed',
    icon: FaTimes,
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    icon: FaBan,
  },
  {
    value: 'FINALIZED',
    label: 'Finalized',
    icon: FaLock,
  },
]

export const blockchains = [
  {
    value: 'ethereum',
    label: 'Ethereum',
    icon: SiEthereum,
  },
  {
    value: 'solana',
    label: 'Solana',
    icon: SiSolana,
  },
  {
    value: 'bitcoin',
    label: 'Bitcoin',
    icon: SiBitcoin,
  },
]

export const tokens = [
  {
    value: 'USDT',
    label: 'USDT',
    icon: SiTether,
  },
  {
    value: 'USDC',
    label: 'USDC',
    icon: RiMoneyDollarCircleFill,
  },
  {
    value: 'SOL',
    label: 'SOL',
    icon: SiSolana,
  },
]
