# Requirements Document

## Introduction

Revamp sistem manajemen pesanan pada website e-commerce cetak sablon Safa Apparel. Revamp ini mencakup:
- Penghapusan menu "Riwayat Transaksi" dari popup profil pengguna
- Redesain total halaman Pesanan Saya dengan statistik ringkasan dan panel detail lengkap
- Sistem pelacakan dua fase: timeline produksi internal (admin-driven) dan pelacakan pengiriman otomatis via Binderbyte API
- Revamp halaman admin pesanan dengan input resi dan pemilih tahap produksi
- Notifikasi otomatis ke pelanggan pada setiap perubahan status kritis

Fitur ini memperluas tipe `Order` yang sudah ada, `OrderContext`, dan `NotificationContext` di localStorage tanpa mengubah alur checkout yang berjalan.

---

## Glossary

- **Order_Management_System**: Keseluruhan sistem yang mengelola pesanan di sisi pelanggan dan admin
- **Pesanan_Saya_Page**: Halaman `/pesanan-saya` yang menampilkan daftar dan detail pesanan milik pelanggan yang sedang login
- **Admin_Orders_Page**: Halaman `/admin/orders` yang digunakan admin untuk mengelola semua pesanan
- **User_Profile_Popup**: Komponen dropdown profil pengguna di header yang menampilkan menu navigasi akun
- **Production_Timeline**: Fase 1 dari sistem pelacakan — urutan tahap produksi internal yang dikelola admin
- **Shipping_Tracker**: Fase 2 dari sistem pelacakan — komponen yang mengambil dan menampilkan status pengiriman dari Binderbyte API
- **Binderbyte_API**: Layanan API pihak ketiga di `https://api.binderbyte.com` yang menyediakan data pelacakan pengiriman real-time
- **Order_Type**: Interface TypeScript `Order` di `lib/types.ts` yang mendefinisikan struktur data pesanan
- **Order_Context**: React context di `lib/contexts/order-context.tsx` yang menyimpan dan mengelola state pesanan via localStorage
- **Notification_Context**: React context di `lib/contexts/notification-context.tsx` yang mengelola notifikasi in-app via localStorage
- **Stats_Summary**: Kartu ringkasan berisi hitungan pesanan per kategori status yang ditampilkan di bagian atas Pesanan_Saya_Page
- **Order_Detail_Panel**: Komponen yang menampilkan informasi lengkap sebuah pesanan termasuk produk, alamat, pembayaran, timeline produksi, dan pelacakan pengiriman
- **Production_Stage**: Satu dari enam tahap produksi internal: Menunggu Pembayaran → Pembayaran Diterima → Desain Direview → Produksi → Quality Control → Siap Dikirim
- **Shipping_Status**: Satu dari lima tahap pengiriman: Diserahkan ke Ekspedisi → Dalam Perjalanan → Sampai di Kota Tujuan → Sedang Diantar → Terkirim
- **Resi**: Nomor resi / nomor lacak (tracking number) dari kurir pengiriman
- **Kurir**: Jasa pengiriman. Nilai yang valid: J&T, JNE, SiCepat, AnterAja, Pos Indonesia

---

## Requirements

### Requirement 1: Pembaruan Tipe Data Order

**User Story:** Sebagai developer, saya ingin memperluas tipe `Order` yang ada agar dapat menyimpan data tahap produksi, informasi resi, dan metadata pembayaran, sehingga fitur-fitur baru dapat diimplementasikan tanpa mengubah alur checkout yang sudah ada.

#### Acceptance Criteria

1. THE `Order_Type` SHALL memiliki field `productionStage` bertipe `'menunggu_pembayaran' | 'pembayaran_diterima' | 'desain_direview' | 'produksi' | 'quality_control' | 'siap_dikirim'` yang bersifat opsional (`?`)
2. THE `Order_Type` SHALL memiliki field `productionUpdatedAt` bertipe `string` (ISO date string) yang bersifat opsional (`?`) untuk mencatat waktu pembaruan tahap produksi terakhir
3. THE `Order_Type` SHALL memiliki field `shippingCourier` bertipe `'J&T' | 'JNE' | 'SiCepat' | 'AnterAja' | 'Pos Indonesia'` yang bersifat opsional (`?`)
4. THE `Order_Type` SHALL memiliki field `shippingResi` bertipe `string` yang bersifat opsional (`?`) untuk menyimpan nomor resi
5. THE `Order_Type` SHALL memiliki field `paymentMethod` bertipe `string` yang bersifat opsional (`?`) untuk menyimpan metode pembayaran yang dipilih pelanggan
6. THE `Order_Type` SHALL memiliki field `paymentDate` bertipe `string` (ISO date string) yang bersifat opsional (`?`) untuk mencatat tanggal pembayaran dikonfirmasi
7. WHEN field-field baru ditambahkan, THE `Order_Context` SHALL tetap kompatibel dengan pesanan lama yang tersimpan di localStorage tanpa field tersebut (field opsional dengan nilai `undefined` tidak boleh menyebabkan error rendering)

---

### Requirement 2: Penghapusan Menu Riwayat Transaksi

**User Story:** Sebagai pengguna, saya ingin menu profil yang lebih sederhana hanya dengan fitur yang relevan, sehingga navigasi akun saya menjadi lebih bersih dan tidak membingungkan.

#### Acceptance Criteria

1. THE `User_Profile_Popup` SHALL menampilkan tepat tiga item menu: Pesanan Saya, Alamat Pengiriman, dan Logout
2. THE `User_Profile_Popup` SHALL tidak menampilkan item menu "Riwayat Transaksi" dan panel `transactions` terkait
3. WHEN pengguna mengklik "Pesanan Saya" di `User_Profile_Popup`, THE `User_Profile_Popup` SHALL menavigasi pengguna ke halaman `/pesanan-saya`
4. THE `User_Profile_Popup` SHALL mempertahankan fungsionalitas Alamat Pengiriman dan Logout yang sudah ada

---

### Requirement 3: Statistik Ringkasan Pesanan

**User Story:** Sebagai pelanggan, saya ingin melihat ringkasan jumlah pesanan per status di bagian atas halaman Pesanan Saya, sehingga saya bisa langsung mengetahui kondisi pesanan saya secara keseluruhan.

#### Acceptance Criteria

1. THE `Pesanan_Saya_Page` SHALL menampilkan `Stats_Summary` yang berisi enam kartu statistik: Total Pesanan, Menunggu Pembayaran, Diproses, Dikirim, Selesai, dan Dibatalkan
2. WHEN halaman dimuat, THE `Stats_Summary` SHALL menghitung dan menampilkan jumlah pesanan milik pengguna yang sedang login untuk setiap kategori status
3. THE `Stats_Summary` SHALL menampilkan angka `0` pada kartu yang tidak memiliki pesanan di kategori tersebut
4. WHEN pengguna mengklik salah satu kartu `Stats_Summary`, THE `Pesanan_Saya_Page` SHALL memfilter daftar pesanan untuk hanya menampilkan pesanan dengan status yang sesuai dengan kartu yang diklik
5. WHILE pengguna login, THE `Stats_Summary` SHALL hanya menghitung pesanan milik pengguna tersebut, bukan seluruh pesanan di sistem

---

### Requirement 4: Daftar Pesanan yang Diperbarui

**User Story:** Sebagai pelanggan, saya ingin melihat daftar pesanan saya dengan informasi yang lebih lengkap dan tombol untuk melihat detail, sehingga saya bisa dengan mudah memantau semua pesanan saya.

#### Acceptance Criteria

1. THE `Pesanan_Saya_Page` SHALL menampilkan setiap pesanan dalam baris yang memuat: Nomor Pesanan, Nama Produk (item pertama atau semua item jika lebih dari satu), Metode Sablon, Jumlah (quantity total), Total harga, Status (badge berwarna), Tanggal pesanan, dan Tombol "Lihat Detail"
2. WHEN terdapat lebih dari satu item dalam satu pesanan, THE `Pesanan_Saya_Page` SHALL menampilkan semua nama produk yang dipisahkan koma pada kolom Nama Produk
3. THE `Pesanan_Saya_Page` SHALL mengurutkan daftar pesanan dari yang terbaru ke yang terlama berdasarkan `createdAt`
4. WHEN pengguna mengklik Tombol "Lihat Detail", THE `Pesanan_Saya_Page` SHALL menampilkan `Order_Detail_Panel` untuk pesanan tersebut
5. THE `Pesanan_Saya_Page` SHALL mempertahankan tab filter (Semua, Menunggu, Diproses, Dikirim, Selesai, Dibatalkan) yang sudah ada
6. WHEN tidak ada pesanan setelah filter diterapkan, THE `Pesanan_Saya_Page` SHALL menampilkan pesan kosong yang sesuai dengan status filter yang aktif

---

### Requirement 5: Panel Detail Pesanan Lengkap

**User Story:** Sebagai pelanggan, saya ingin melihat semua informasi lengkap mengenai sebuah pesanan dalam satu panel, sehingga saya tidak perlu berpindah halaman untuk mengetahui status produksi, detail produk, alamat, dan informasi pembayaran saya.

#### Acceptance Criteria

1. THE `Order_Detail_Panel` SHALL menampilkan seksi Informasi Pesanan yang memuat: Nomor Pesanan, Tanggal dibuat, Status pesanan (badge), dan Status pembayaran (badge)
2. THE `Order_Detail_Panel` SHALL menampilkan seksi Informasi Produk yang memuat untuk setiap item: Nama produk, Jenis sablon/metode, Quantity, Harga satuan, Subtotal item, dan preview/link file desain jika `designUrl` tersedia
3. IF `customization.designUrl` tersedia pada sebuah item, THEN THE `Order_Detail_Panel` SHALL menampilkan preview gambar atau tautan unduhan untuk file desain tersebut
4. THE `Order_Detail_Panel` SHALL menampilkan seksi Alamat Pengiriman dari `order.shippingAddress`
5. THE `Order_Detail_Panel` SHALL menampilkan seksi Informasi Pembayaran yang memuat: Metode pembayaran (`paymentMethod` jika ada), Status pembayaran, dan Tanggal pembayaran (`paymentDate` jika ada)
6. THE `Order_Detail_Panel` SHALL menampilkan `Production_Timeline` sebagai komponen terpisah di dalam panel
7. WHEN `shippingResi` dan `shippingCourier` tersedia pada pesanan, THE `Order_Detail_Panel` SHALL menampilkan komponen `Shipping_Tracker`
8. WHEN pengguna mengklik tombol tutup, THE `Order_Detail_Panel` SHALL menutup panel dan kembali menampilkan daftar pesanan

---

### Requirement 6: Timeline Produksi Internal (Fase 1)

**User Story:** Sebagai pelanggan, saya ingin melihat kemajuan produksi pesanan saya secara visual melalui timeline vertikal dengan tanda centang, sehingga saya tahu pesanan saya sedang berada di tahap mana dalam proses produksi.

#### Acceptance Criteria

1. THE `Production_Timeline` SHALL menampilkan enam tahap secara berurutan dalam layout vertikal: Menunggu Pembayaran, Pembayaran Diterima, Desain Direview, Produksi, Quality Control, Siap Dikirim
2. WHEN sebuah `Production_Stage` telah selesai atau merupakan tahap saat ini (termasuk tahap pertama `'menunggu_pembayaran'` ketika itu adalah tahap aktif), THE `Production_Timeline` SHALL menampilkan ikon centang (✓) dan styling visual berbeda (warna aktif) pada tahap tersebut
3. WHEN sebuah `Production_Stage` belum dicapai, THE `Production_Timeline` SHALL menampilkan tahap tersebut dengan styling netral (warna muted/abu-abu)
4. THE `Production_Timeline` SHALL menampilkan label teks untuk setiap tahap
5. IF `productionStage` pada pesanan bernilai `undefined`, THEN THE `Production_Timeline` SHALL menampilkan semua tahap dalam status belum selesai dengan tahap pertama ditandai sebagai aktif

---

### Requirement 7: Pelacakan Pengiriman Otomatis (Fase 2)

**User Story:** Sebagai pelanggan, saya ingin melihat status pengiriman paket saya secara real-time yang diambil otomatis dari API kurir, sehingga saya tahu persis di mana paket saya berada tanpa perlu membuka website kurir secara terpisah.

#### Acceptance Criteria

1. THE `Shipping_Tracker` SHALL menampilkan nama kurir dan nomor resi dari `order.shippingCourier` dan `order.shippingResi`
2. WHEN `Shipping_Tracker` ditampilkan, THE `Shipping_Tracker` SHALL memanggil Binderbyte API dengan endpoint `https://api.binderbyte.com/v1/track` menggunakan `courier` dan `awb` (resi) yang sesuai
3. WHEN Binderbyte API mengembalikan respons sukses, THE `Shipping_Tracker` SHALL menampilkan history pengiriman dari respons API dalam format timeline kronologis (terbaru di atas)
4. IF Binderbyte API mengembalikan error atau tidak dapat dihubungi, THEN THE `Shipping_Tracker` SHALL menampilkan pesan error yang informatif kepada pengguna tanpa menyebabkan crash halaman
5. WHILE `Shipping_Tracker` sedang mengambil data dari Binderbyte API, THE `Shipping_Tracker` SHALL menampilkan indikator loading
6. THE `Shipping_Tracker` SHALL menyimpan hasil tracking ke localStorage dengan key unik berdasarkan resi untuk menghindari pemanggilan API berulang dalam sesi yang sama
7. WHEN data tracking tersimpan di localStorage sudah berumur lebih dari 30 menit, THE `Shipping_Tracker` SHALL mengambil ulang data dari Binderbyte API; WHILE data cache berumur 30 menit atau kurang, THE `Shipping_Tracker` SHALL menggunakan data cache tanpa menampilkan error

---

### Requirement 8: Revamp Halaman Admin Pesanan — Input Resi

**User Story:** Sebagai admin, saya ingin dapat memasukkan nama kurir dan nomor resi langsung di halaman admin pesanan setelah paket dikirim, sehingga sistem dapat secara otomatis memperbarui status dan mengirim notifikasi ke pelanggan.

#### Acceptance Criteria

1. THE `Admin_Orders_Page` SHALL menampilkan seksi "Informasi Pengiriman" dalam panel detail pesanan yang dipilih
2. THE `Admin_Orders_Page` SHALL menampilkan dropdown Kurir dengan pilihan: J&T, JNE, SiCepat, AnterAja, Pos Indonesia
3. THE `Admin_Orders_Page` SHALL menampilkan input teks untuk Nomor Resi
4. THE `Admin_Orders_Page` SHALL menampilkan tombol "Simpan Resi"
5. WHEN admin mengklik tombol "Simpan Resi" dengan Kurir dan Nomor Resi yang telah diisi, THE `Admin_Orders_Page` SHALL menyimpan `shippingCourier` dan `shippingResi` ke pesanan via `Order_Context.updateOrder`
6. WHEN admin mengklik tombol "Simpan Resi" dengan Kurir dan Nomor Resi yang telah diisi, THE `Admin_Orders_Page` SHALL secara otomatis mengubah `status` pesanan menjadi `'shipped'`
7. WHEN admin mengklik tombol "Simpan Resi" dengan Kurir dan Nomor Resi yang telah diisi, THE `Admin_Orders_Page` SHALL memanggil `addNotification` untuk mengirim notifikasi kepada pelanggan yang berisi nomor pesanan dan informasi resi
8. IF admin mengklik tombol "Simpan Resi" dengan Kurir atau Nomor Resi yang kosong, THEN THE `Admin_Orders_Page` SHALL menampilkan pesan validasi dan tidak menyimpan perubahan
9. WHEN resi sudah tersimpan pada pesanan, THE `Admin_Orders_Page` SHALL menampilkan nilai kurir dan resi saat ini di dalam form sebagai nilai default

---

### Requirement 9: Revamp Halaman Admin Pesanan — Pemilih Tahap Produksi

**User Story:** Sebagai admin, saya ingin mengelola status produksi pesanan menggunakan pemilih tahap produksi yang spesifik (bukan dropdown status umum), sehingga pelacakan produksi lebih granular dan pelanggan mendapat notifikasi pada momen yang tepat.

#### Acceptance Criteria

1. THE `Admin_Orders_Page` SHALL mengganti dropdown "Ubah Status" yang ada dengan pemilih `Production_Stage` yang memiliki enam pilihan: Menunggu Pembayaran, Pembayaran Diterima, Desain Direview, Produksi, Quality Control, Siap Dikirim
2. WHEN admin memilih `Production_Stage` baru, THE `Admin_Orders_Page` SHALL menyimpan nilai baru ke `productionStage` dan `productionUpdatedAt` pada pesanan via `Order_Context.updateOrder`
3. WHEN admin memilih tahap `'pembayaran_diterima'`, THE `Admin_Orders_Page` SHALL mengubah `paymentStatus` pesanan menjadi `'paid'` dan `paymentDate` menjadi timestamp saat ini
4. WHEN admin memilih tahap `'siap_dikirim'`, THE `Admin_Orders_Page` SHALL mengubah `status` pesanan menjadi `'ready'`
5. THE `Admin_Orders_Page` SHALL menampilkan nilai `productionStage` yang tersimpan sebagai nilai yang terpilih secara default pada pemilih tahap produksi
6. THE `Admin_Orders_Page` SHALL mempertahankan kemampuan admin untuk mengubah status pesanan ke `'cancelled'` melalui mekanisme terpisah (misalnya tombol batalkan pesanan)

---

### Requirement 10: Sistem Notifikasi Otomatis

**User Story:** Sebagai pelanggan, saya ingin menerima notifikasi in-app secara otomatis setiap kali status pesanan saya berubah pada momen-momen penting, sehingga saya selalu terinformasi tanpa harus aktif memantau halaman pesanan.

#### Acceptance Criteria

1. WHEN admin mengubah `productionStage` menjadi `'pembayaran_diterima'`, THE `Notification_Context` SHALL menambahkan notifikasi kepada pelanggan dengan judul "💳 Pembayaran Diterima" dan pesan yang menyebutkan nomor pesanan
2. WHEN admin mengubah `productionStage` menjadi `'produksi'`, THE `Notification_Context` SHALL menambahkan notifikasi kepada pelanggan dengan judul "⚙️ Produksi Dimulai" dan pesan yang menyebutkan nomor pesanan
3. WHEN admin mengubah `productionStage` menjadi `'quality_control'`, THE `Notification_Context` SHALL menambahkan notifikasi kepada pelanggan dengan judul "🔍 Quality Control" dan pesan yang menyebutkan nomor pesanan
4. WHEN admin menyimpan resi pengiriman, THE `Notification_Context` SHALL menambahkan notifikasi kepada pelanggan dengan judul "📬 Resi Ditambahkan" dan pesan yang menyebutkan nomor pesanan beserta nama kurir dan nomor resi
5. WHEN `status` pesanan diubah menjadi `'shipped'`, THE `Notification_Context` SHALL menambahkan notifikasi kepada pelanggan dengan judul "🚚 Paket Dikirim" dan pesan yang menyebutkan nomor pesanan
6. WHEN `Shipping_Tracker` mendeteksi status akhir "Terkirim" dari Binderbyte API dan `status` pesanan belum `'delivered'`, THE `Notification_Context` SHALL menambahkan notifikasi kepada pelanggan dengan judul "🎉 Paket Diterima" dan `Order_Context.updateOrder` SHALL mengubah `status` pesanan menjadi `'delivered'`
7. THE `Notification_Context` SHALL menyimpan semua notifikasi baru ke localStorage menggunakan mekanisme `addNotification` yang sudah ada
8. WHEN notifikasi baru ditambahkan, THE notification bell di header SHALL menampilkan badge jumlah notifikasi yang belum dibaca

---

### Requirement 11: Kompatibilitas Checkout yang Sudah Ada

**User Story:** Sebagai developer, saya ingin memastikan bahwa semua perubahan pada sistem manajemen pesanan tidak merusak alur checkout yang sudah berjalan, sehingga pelanggan tetap dapat melakukan pemesanan baru tanpa gangguan.

#### Acceptance Criteria

1. WHEN pelanggan menyelesaikan checkout dan pesanan baru dibuat via `Order_Context.addOrder`, THE `Order_Context` SHALL menerima objek pesanan yang tidak memiliki field `productionStage`, `shippingResi`, `shippingCourier`, `paymentDate` dan juga menerima pesanan yang hanya memiliki sebagian field baru tersebut, tanpa error
2. THE checkout page SHALL tidak memerlukan perubahan apapun pada logika pembuatan pesanan yang sudah ada
3. WHEN halaman `Pesanan_Saya_Page` merender pesanan lama yang tidak memiliki `productionStage`, THE `Production_Timeline` SHALL menampilkan semua tahap dalam status belum dimulai tanpa error TypeScript atau runtime error
4. THE `Order_Context.updateOrder` SHALL mendukung pembaruan parsial sehingga field-field baru dapat diperbarui tanpa harus menyertakan seluruh objek pesanan
