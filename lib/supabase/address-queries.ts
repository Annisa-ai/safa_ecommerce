import { supabase } from './client'
import type { UserAddress } from '@/lib/contexts/address-context'

export const getUserAddresses = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const createAddress = async (addr: Partial<UserAddress>) => {
  const payload: any = {
    user_id: addr.userId,
    label: addr.label ?? 'Rumah',
    recipient_name: addr.recipientName,
    phone: addr.phone,
    province: addr.province,
    city: addr.city,
    district: addr.district,
    postal_code: addr.postalCode,
    full_address: addr.fullAddress,
    landmark: addr.landmark ?? null,
    is_default: addr.isDefault ?? false,
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert(payload)
    .select('*')
    .single()

  return { data, error }
}

export const updateAddress = async (id: string, updates: Partial<UserAddress>) => {
  const payload: any = {}
  if (updates.label !== undefined) payload.label = updates.label
  if (updates.recipientName !== undefined) payload.recipient_name = updates.recipientName
  if (updates.phone !== undefined) payload.phone = updates.phone
  if (updates.province !== undefined) payload.province = updates.province
  if (updates.city !== undefined) payload.city = updates.city
  if (updates.district !== undefined) payload.district = updates.district
  if (updates.postalCode !== undefined) payload.postal_code = updates.postalCode
  if (updates.fullAddress !== undefined) payload.full_address = updates.fullAddress
  if (updates.landmark !== undefined) payload.landmark = updates.landmark
  if (updates.isDefault !== undefined) payload.is_default = updates.isDefault

  const { data, error } = await supabase
    .from('user_addresses')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  return { data, error }
}

export const deleteAddress = async (id: string) => {
  const { data, error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id)

  return { data, error }
}

export default { getUserAddresses, createAddress, updateAddress, deleteAddress }
