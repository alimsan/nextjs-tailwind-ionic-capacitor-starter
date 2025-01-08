import React, { useState, useEffect } from 'react';
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
} from '@ionic/react';
import { useParams } from 'react-router-dom';

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

type ListDetailParams = {
  listId: string;
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).replace(/^data:image\/\w+;base64,/, "");
        setImageBase64(base64String);
        setEditData((prev) => prev ? { ...prev, foto: base64String } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    if (editData) {
      try {
        const dataToSend = { ...editData };
        if (imageBase64) {
          dataToSend.foto = imageBase64; // Tambahkan hanya jika ada foto baru
        } else {
          dataToSend.foto = ''; // Tetapkan undefined untuk tidak dikirim
        }

        const response = await fetch(`${apiUrl}/api/mitraresto/makanan/upcreate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });
        const result = await response.json();
        if (result.status === 'success') {
          setMakanan((prev) =>
            prev.map((item) => (item.id === editData.id ? { ...item, ...result.data } : item))
          );
          setShowEditModal(false);
          setImageBase64(null);
        } else {
          console.error(result.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
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
            <IonLabel>Nama Menu</IonLabel>
            <IonInput
              value={editData?.nama_menu}
              onIonChange={(e) => setEditData((prev) => prev ? { ...prev, nama_menu: e.detail.value! } : null)}
            />
            <IonLabel>Harga</IonLabel>
            <IonInput
              type="number"
              value={editData?.harga}
              onIonChange={(e) => setEditData((prev) => prev ? { ...prev, harga: parseInt(e.detail.value!, 10) } : null)}
            />
            <IonLabel>Deskripsi</IonLabel>
            <IonTextarea
              value={editData?.deskripsi_menu}
              onIonChange={(e) => setEditData((prev) => prev ? { ...prev, deskripsi_menu: e.detail.value! } : null)}
            />
            <IonLabel>Foto</IonLabel>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <IonButton expand="full" color="primary" onClick={handleSaveEdit}>
              Simpan
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/lists" />
          </IonButtons>
          <IonTitle>Daftar Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      <ListItems id_kategori={idkateg || ''} /> {/* Fallback jika makanan undefined */}
      </IonContent>
    </IonPage>
  );
};

export default ListDetail;