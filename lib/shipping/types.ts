export interface RajaOngkirDestination {
  id: string
  label: string
  provinceName: string
  cityName: string
  districtName?: string
  zipCode?: string
}

export interface RajaOngkirShippingOption {
  courier: string
  courierName: string
  service: string
  description: string
  cost: number
  etd: string
}

export interface ShippingSelection extends RajaOngkirShippingOption {
  destinationCityId: string
  destinationLabel: string
  weightGrams: number
}
