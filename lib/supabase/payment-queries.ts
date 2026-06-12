import { supabase } from './client'

export const createPaymentTransaction = async (tx: {
  orderId: number | string
  transactionReference: string
  amount: number
  currency?: string
  paymentMethod?: string
  paymentProvider?: string
  paymentChannel?: string
  status?: string
  paymentDetails?: any
}) => {
  const payload = {
    order_id: Number(tx.orderId),
    transaction_reference: tx.transactionReference,
    amount: tx.amount,
    currency: tx.currency ?? 'IDR',
    payment_method: tx.paymentMethod ?? null,
    payment_provider: tx.paymentProvider ?? null,
    payment_channel: tx.paymentChannel ?? null,
    status: tx.status ?? 'pending',
    payment_details: tx.paymentDetails ?? null,
  }

  const { data, error } = await supabase
    .from('payment_transactions')
    .insert(payload)
    .select('*')
    .single()

  return { data, error }
}

export const getPaymentTransactionsByOrder = async (orderId: number | string) => {
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('order_id', Number(orderId))
    .order('created_at', { ascending: true })

  return { data, error }
}

export const updatePaymentTransaction = async (id: number, updates: Partial<any>) => {
  const { data, error } = await supabase
    .from('payment_transactions')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  return { data, error }
}

export const attachPaymentToOrder = async (orderId: number | string, paymentSummary: any) => {
  const { data, error } = await supabase
    .from('orders')
    .update(paymentSummary)
    .eq('id', Number(orderId))
    .select('*')
    .single()

  return { data, error }
}

export default { createPaymentTransaction, getPaymentTransactionsByOrder, updatePaymentTransaction, attachPaymentToOrder }
