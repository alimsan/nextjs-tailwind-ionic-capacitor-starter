import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonInput,
  IonTextarea,
  IonLabel,
  IonItem,
  IonList,
  IonToast,
} from '@ionic/react';

interface MakananForm {
  nama_menu: string;
  harga: number;
  kategori_menu_makanan: number;
  deskripsi_menu: string;
  foto: string;
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

const AddMakanan = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<MakananForm>({
    nama_menu: '',
    harga: 0,
    kategori_menu_makanan: 223, // Default value as per your example
    deskripsi_menu: '',
    foto: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (file.size <= 2.5 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            setFormData(prev => ({ ...prev, foto: base64String }));
          };
          reader.readAsDataURL(file);
        } else {
          const optimizedBlob = await resizeImage(file, 1024, 1024);
          
          if (optimizedBlob.size > 2.5 * 1024 * 1024) {
            setToastMessage('Ukuran file masih terlalu besar setelah optimasi. Mohon gunakan gambar yang lebih kecil.');
            setShowToast(true);
            return;
          }

          const base64String = await blobToBase64(optimizedBlob);
          setFormData(prev => ({ ...prev, foto: base64String }));
        }
      } catch (error) {
        console.error('Error processing image:', error);
        setToastMessage('Gagal memproses gambar. Silakan coba lagi.');
        setShowToast(true);
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mitraresto/makanan/upcreate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        setToastMessage('Menu berhasil ditambahkan');
        setShowToast(true);
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setToastMessage(result.message || 'Gagal menambahkan menu');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('Terjadi kesalahan. Silakan coba lagi.');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/lists" />
          </IonButtons>
          <IonTitle>Tambah Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className="p-4">
          <IonItem>
            <IonLabel position="stacked">Nama Menu</IonLabel>
            <IonInput
              value={formData.nama_menu}
              onIonChange={e => setFormData(prev => ({ ...prev, nama_menu: e.detail.value! }))}
              placeholder="Masukkan nama menu"
              className="mt-1"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Harga</IonLabel>
            <IonInput
              type="number"
              value={formData.harga}
              onIonChange={e => setFormData(prev => ({ ...prev, harga: parseInt(e.detail.value!, 10) }))}
              placeholder="Masukkan harga"
              className="mt-1"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Deskripsi Menu</IonLabel>
            <IonTextarea
              value={formData.deskripsi_menu}
              onIonChange={e => setFormData(prev => ({ ...prev, deskripsi_menu: e.detail.value! }))}
              placeholder="Masukkan deskripsi menu"
              className="mt-1"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Foto Menu</IonLabel>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2"
            />
          </IonItem>

          <div className="p-4">
            <IonButton
              expand="block"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Menu'}
            </IonButton>
          </div>
        </IonList>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default AddMakanan;