import { Product } from '@/lib/types'

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Kaos Sablon Premium',
    description: 'Kaos berkualitas tinggi dengan sablon custom. Cocok untuk souvenir, merchandise, atau kebutuhan corporate.',
    category: 'kaos',
    price: 50000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    printMethods: ['sablon', 'dtf'],
    minOrder: 10
  },
  {
    id: '2',
    name: 'Tote Bag Canvas',
    description: 'Tas belanja ramah lingkungan dengan desain custom. Material canvas tebal dan tahan lama.',
    category: 'tote',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500&h=500&fit=crop',
    printMethods: ['sablon', 'offset'],
    minOrder: 20
  },
  {
    id: '3',
    name: 'Hoodie Sablon',
    description: 'Jaket hoodie premium dengan sablon depan. Bahan tebal dan nyaman digunakan sepanjang hari.',
    category: 'hoodie',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1556821552-5a70e0f5fdbe?w=500&h=500&fit=crop',
    printMethods: ['sablon', 'dtf'],
    minOrder: 15
  },
  {
    id: '4',
    name: 'Jersey Olahraga',
    description: 'Jersey custom untuk tim olahraga atau organisasi. Bahan breathable dan nyaman untuk aktivitas intensif.',
    category: 'jersey',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1609285055440-02d8f3d95b9a?w=500&h=500&fit=crop',
    printMethods: ['dtf', 'offset'],
    minOrder: 25
  },
  {
    id: '5',
    name: 'Kaos Anak-Anak',
    description: 'Kaos sablon untuk anak-anak dengan desain ceria dan bahan yang aman untuk kulit sensitive.',
    category: 'kaos',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&h=500&fit=crop',
    printMethods: ['sablon', 'dtf'],
    minOrder: 15
  },
  {
    id: '6',
    name: 'Kaos Oversized',
    description: 'Kaos oversized trendy dengan sablon full color. Model nyaman dan fashionable untuk casual wear.',
    category: 'kaos',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1618886996285-fcbfac9b62d8?w=500&h=500&fit=crop',
    printMethods: ['dtf'],
    minOrder: 10
  },
  {
    id: '7',
    name: 'Tas Pundak Custom',
    description: 'Tas pundak dengan kapasitas sedang, cocok untuk keperluan sehari-hari dengan branding custom.',
    category: 'tote',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    printMethods: ['sablon', 'offset'],
    minOrder: 12
  },
  {
    id: '8',
    name: 'Jasa Desain Grafis',
    description: 'Layanan desain custom untuk produk sablon Anda. Kami siap mewujudkan ide kreatif Anda menjadi karya nyata.',
    category: 'jasa',
    price: 150000,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop',
    printMethods: ['sablon'],
    minOrder: 1
  }
]
