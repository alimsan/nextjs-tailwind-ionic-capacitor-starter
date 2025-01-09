import React, { useState, useEffect } from 'react';
import { add } from 'ionicons/icons';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  IonThumbnail,
  IonImg,
  IonCheckbox,
  IonButton,
  IonAlert,
  IonModal,
  IonInput,
  IonTextarea,
  IonSkeletonText,
  IonIcon,
} from '@ionic/react';

interface Makanan {
  id: number;
  nama_menu: string;
  harga: number;
  deskripsi_menu: string;
  foto: string;
  kategori_menu_makanan: number;
}

interface ApiResponse {
  status: string;
  message: string;
  data: Makanan[];
}

const resizeImage = async (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob!);
          },
          'image/jpeg',
          0.6
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(blob);
  });
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(price);
};

const apiFto = process.env.NEXT_PUBLIC_API_URL;
const getFotoUrl = (filename: string) => {
  return `${apiFto}/storage/asset/fotomenumakanan/${filename}`;
};

const ListItems = ({ id_kategori }: { id_kategori: string }) => {
  const [makanan, setMakanan] = useState<Makanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Makanan | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama_menu: '',
    harga: 0,
    deskripsi_menu: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Monitor perubahan state untuk debugging
    console.log('Form Data:', formData);
    console.log('Edit Data:', editData);
  }, [formData, editData]);

  useEffect(() => {
    // Error boundary untuk mobile debugging
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      console.log('Error: ' + msg + '\nurl: ' + url + '\nLine: ' + lineNo);
      return false;
    };
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        nama_menu: editData.nama_menu,
        harga: editData.harga,
        deskripsi_menu: editData.deskripsi_menu
      });
    }
  }, [editData]);

  useEffect(() => {
    const fetchMakanan = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/mitraresto/makanan/kategori?id_kategori_makanan=${id_kategori}`);
        const data: ApiResponse = await response.json();

        if (data.status === 'success') {
          setMakanan(data.data);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError('Gagal memuat daftar makanan');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMakanan();
  }, [id_kategori]);

  const handleChange = (field: string, value: any) => {
    console.log(`Updating ${field} with value:`, value); // Debug log
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${apiUrl}/api/mitraresto/makanan/destroy?id=${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.status === 'success') {
        setMakanan((prev) => prev.filter((item) => item.id !== id));
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedItems) {
      await handleDelete(id);
    }
    setSelectedItems([]);
  };

  const handleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleEdit = (item: Makanan) => {
    setEditData(item);
    setShowEditModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (file.size <= 2.5 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            setImageBase64(base64String);
          };
          reader.readAsDataURL(file);
        } else {
          const optimizedBlob = await resizeImage(file, 1024, 1024);
          
          if (optimizedBlob.size > 2.5 * 1024 * 1024) {
            alert('Ukuran file masih terlalu besar setelah optimasi. Mohon gunakan gambar yang lebih kecil.');
            return;
          }

          const base64String = await blobToBase64(optimizedBlob);
          setImageBase64(base64String);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Gagal memproses gambar. Silakan coba lagi.');
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    if (isSaving) return;

    try {
      setIsSaving(true);
      const dataToSend = {
        ...editData,
        ...formData,
        foto: imageBase64 || ''
      };

      console.log('Data yang akan dikirim:', dataToSend);

      const response = await fetch(`${apiUrl}/api/mitraresto/makanan/upcreate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();
      console.log('Response dari server:', result);

      if (result.status === 'success') {
        setMakanan(prev =>
          prev.map(item => (item.id === editData.id ? { ...item, ...formData } : item))
        );
        setShowEditModal(false);
        setImageBase64(null);
        setFormData({ nama_menu: '', harga: 0, deskripsi_menu: '' });
      } else {
        alert('Gagal menyimpan perubahan: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <IonList>
        {[...Array(5)].map((_, i) => (
          <IonItem key={i}>
            <IonThumbnail slot="start">
              <IonSkeletonText animated={true} />
            </IonThumbnail>
            <IonLabel>
              <IonSkeletonText animated={true} style={{ width: '70%' }} />
              <IonSkeletonText animated={true} style={{ width: '40%' }} />
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <IonList>
      {makanan.map((item) => (
        <IonItem key={item.id}>
          <IonCheckbox
            slot="start"
            checked={selectedItems.includes(item.id)}
            onIonChange={() => handleSelect(item.id)}
          />
          <IonThumbnail slot="start" className="h-16 w-16">
            <IonImg
              src={getFotoUrl(item.foto)}
              alt={item.nama_menu}
              className="w-full h-full object-cover rounded-lg"
            />
          </IonThumbnail>
          <IonLabel>
            <h2 className="font-medium">{item.nama_menu}</h2>
            <p className="text-sm text-gray-500">{item.deskripsi_menu}</p>
            <p className="text-primary font-medium mt-1">{formatPrice(item.harga)}</p>
          </IonLabel>
          <IonButton color="warning" onClick={() => handleEdit(item)}>
            Edit
          </IonButton>
          <IonButton color="danger" onClick={() => { setShowDeleteConfirm(true); setCurrentDeleteId(item.id); }}>
            Hapus
          </IonButton>
        </IonItem>
      ))}
      <IonButton color="danger" expand="full" onClick={handleBulkDelete} disabled={selectedItems.length === 0}>
        Hapus yang Dipilih
      </IonButton>

      <IonAlert
        isOpen={showDeleteConfirm}
        onDidDismiss={() => setShowDeleteConfirm(false)}
        header={'Konfirmasi Hapus'}
        message={`Apakah Anda yakin ingin menghapus item ini?`}
        buttons={[
          {
            text: 'Batal',
            role: 'cancel',
            handler: () => setShowDeleteConfirm(false)
          },
          {
            text: 'Hapus',
            handler: () => {
              if (currentDeleteId !== null) handleDelete(currentDeleteId);
            }
          }
        ]}
      />

      <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit Menu</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowEditModal(false)}>Tutup</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="p-4">
            <IonItem>
              <IonLabel position="stacked">Nama Menu</IonLabel>
              <IonInput
                value={formData.nama_menu}
                onIonChange={e => handleChange('nama_menu', e.detail.value)}
                onInput={e => handleChange('nama_menu', (e.target as HTMLInputElement).value)}
                placeholder="Masukkan nama menu"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Harga</IonLabel>
              <IonInput
                type="number"
                value={formData.harga}
                onIonChange={e => handleChange('harga', parseInt(e.detail.value || '0', 10))}
                onInput={e => handleChange('harga', parseInt((e.target as HTMLInputElement).value || '0', 10))}
                placeholder="Masukkan harga"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Deskripsi</IonLabel>
              <IonTextarea
                value={formData.deskripsi_menu}
                onIonChange={e => handleChange('deskripsi_menu', e.detail.value)}
                onInput={e => handleChange('deskripsi_menu', (e.target as HTMLInputElement).value)}
                placeholder="Masukkan deskripsi"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Foto</IonLabel>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </IonItem>

            <IonButton 
              expand="full" 
              color="primary" 
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="mt-4"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
    </IonList>
  );
};

const ListDetail= () => {
  const pathname = usePathname();
  const idkateg = pathname.split('/').pop()
  const router = useRouter();
  const handleAddMenu = () => {
    router.push('/add-makanan');
  };
  if (idkateg) {
    sessionStorage.setItem('id_kategori_makanan', idkateg);
  } else {
    console.error('ID kategori makanan tidak ditemukan');
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/lists" />
          </IonButtons>
          <IonTitle>Daftar Menu</IonTitle>
          <IonButtons slot="end">
            <IonButton 
            onClick={handleAddMenu}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      <ListItems id_kategori={idkateg || ''} /> {/* Fallback jika makanan undefined */}
      </IonContent>
    </IonPage>
  );
};

export default ListDetail;