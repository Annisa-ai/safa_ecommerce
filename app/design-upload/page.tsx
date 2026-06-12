'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DropZone } from '@/components/ui/drop-zone'

export default function DesignUploadPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    file: null as File | null,
    filePreview: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFileChange = (file: File) => {
    const preview = URL.createObjectURL(file)
    setFormData(prev => ({ ...prev, file, filePreview: preview }))
  }

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, file: null, filePreview: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone || !formData.file) {
      alert('Mohon lengkapi semua data')
      return
    }
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Upload Desain</h1>
            <p className="text-lg text-muted-foreground">
              Upload desain Anda dan tim kami akan memproses pesanan dengan cermat
            </p>
          </div>

          <Card className="p-8 border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nama Lengkap
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nama Anda"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email Anda"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nomor Telepon
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="08xx-xxxx-xxxx"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Deskripsi Pesanan
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Jelaskan pesanan Anda, jumlah item, warna, ukuran, dll..."
                  className="w-full h-32 px-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  Upload File Desain
                </label>
                <DropZone
                  accept=".pdf,.jpg,.jpeg,.png,.ai,.psd,image/*"
                  label="Klik atau drag & drop file desain di sini"
                  hint="Format: PDF, JPG, PNG, AI, PSD (Maks 10MB)"
                  previewUrl={formData.filePreview}
                  file={formData.file}
                  onChange={handleFileChange}
                  onRemove={handleRemoveFile}
                  imagePreview
                />
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <p className="text-sm text-foreground/70">
                  <span className="font-medium">Tips:</span> Gunakan resolusi tinggi (300 DPI minimum) dan ukuran sesuai produk yang Anda pesan untuk hasil terbaik.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Kirim Desain
              </Button>

              {isSubmitted && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center text-green-800">
                  <p className="font-medium">Desain berhasil dikirim!</p>
                  <p className="text-sm mt-1">Tim kami akan segera menghubungi Anda untuk konfirmasi detail pesanan.</p>
                </div>
              )}
            </form>
          </Card>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <Card className="p-6 border border-border text-center">
              <div className="text-4xl mb-4">◆</div>
              <h3 className="font-bold text-foreground mb-2">Upload File</h3>
              <p className="text-sm text-muted-foreground">Upload file desain Anda dalam format standar</p>
            </Card>
            <Card className="p-6 border border-border text-center">
              <div className="text-4xl mb-4">▲</div>
              <h3 className="font-bold text-foreground mb-2">Konfirmasi</h3>
              <p className="text-sm text-muted-foreground">Kami akan segera menghubungi untuk detail pesanan</p>
            </Card>
            <Card className="p-6 border border-border text-center">
              <div className="text-4xl mb-4">■</div>
              <h3 className="font-bold text-foreground mb-2">Proses</h3>
              <p className="text-sm text-muted-foreground">Pesanan Anda akan diproses dengan profesional</p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
