export interface ScenicSpot {
  _id: string
  name: string
  province: string
  city: string
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  address: string
  description: string
  highlights: string[]
  category: string
  ticketInfo: {
    price: number
    description: string
  }
  openTime: string
  rating: number
  images: string[]
  wikiUrl: string
  createdAt: string
  updatedAt: string
}
