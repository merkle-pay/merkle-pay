import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconTrash } from '@tabler/icons-react'
import { mpFetch } from '@/queries/mp_fetch'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import './create-business-form.scss'

const businessFormSchema = z.object({
  business_name: z
    .string()
    .min(1, { message: 'Business name is required.' })
    .max(100, {
      message: 'Business name must not be longer than 100 characters.',
    }),
  blockchain: z.string().min(1, { message: 'Blockchain is required.' }),
  wallets: z.array(
    z.object({ value: z.string().min(1, { message: 'Wallet is required.' }) })
  ),
  tokens: z.array(
    z.object({ value: z.string().min(1, { message: 'Token is required.' }) })
  ),
})

type BusinessFormValues = z.infer<typeof businessFormSchema>

export function CreateBusinessForm() {
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      business_name: '',
      blockchain: '',
      wallets: [{ value: '' }],
      tokens: [{ value: '' }],
    },
    mode: 'onChange',
  })

  const {
    fields: walletFields,
    append: appendWallet,
    remove: removeWallet,
  } = useFieldArray({
    name: 'wallets',
    control: form.control,
  })

  const {
    fields: tokenFields,
    append: appendToken,
    remove: removeToken,
  } = useFieldArray({
    name: 'tokens',
    control: form.control,
  })

  async function onSubmit(businessFormValues: BusinessFormValues) {
    const { business_name, blockchain, wallets, tokens } = businessFormValues

    const { code, message } = await mpFetch('/api/dashboard/businesses', {
      method: 'POST',
      body: JSON.stringify({
        business_name,
        blockchain: blockchain.toLowerCase(),
        wallets: wallets.map((wallet) => wallet.value),
        tokens: tokens.map((token) => token.value),
      }),
    })

    if (code !== 201) {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      return
    }
    toast({
      title: 'Business created',
      description: 'Your business has been created successfully',
    })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='business_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder='My Awesome Business' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='blockchain'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blockchain</FormLabel>
              <FormControl>
                <Input placeholder='Ethereum, Solana, etc.' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='space-y-2'>
          {walletFields.map((field, index) => (
            <div
              key={field.id}
              className='create-business-form__Wallets flex w-full items-end gap-2'
            >
              <FormField
                control={form.control}
                name={`wallets.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>
                      Wallet
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className='cursor-pointer'
                type='button'
                variant='destructive'
                size='icon'
                onClick={() => removeWallet(index)}
                disabled={walletFields.length === 1} // Optionally prevent removing the last field
              >
                <IconTrash size={18} />
              </Button>
            </div>
          ))}
          <Button type='button' onClick={() => appendWallet({ value: '' })}>
            Add Wallet
          </Button>
        </div>

        <div className='space-y-2'>
          {tokenFields.map((field, index) => (
            <div
              key={field.id}
              className='create-business-form__Tokens flex w-full items-end gap-2'
            >
              <FormField
                control={form.control}
                name={`tokens.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>
                      Token
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className='cursor-pointer'
                type='button'
                variant='destructive'
                size='icon'
                onClick={() => removeToken(index)}
                disabled={tokenFields.length === 1}
              >
                <IconTrash size={18} />
              </Button>
            </div>
          ))}
          <Button type='button' onClick={() => appendToken({ value: '' })}>
            Add Token
          </Button>
        </div>
        <Button type='submit'>Create business</Button>
      </form>
    </Form>
  )
}
