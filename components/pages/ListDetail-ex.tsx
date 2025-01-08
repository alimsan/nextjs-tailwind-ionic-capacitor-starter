import React, { useState, useEffect } from 'react';
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
  IonSkeletonText,
  IonThumbnail,
  IonImg,
} from '@ionic/react';
import { useParams } from 'react-router-dom';

interface Makanan {
  id: number;
  nama_menu: string;
  harga: number;
  deskripsi: string;
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
          <IonThumbnail slot="start" className="h-16 w-16">
            <IonImg 
              src={getFotoUrl(item.foto)} 
              alt={item.nama_menu}
              className="w-full h-full object-cover rounded-lg"
            />
          </IonThumbnail>
          <IonLabel>
            <h2 className="font-medium">{item.nama_menu}</h2>
            <p className="text-sm text-gray-500">{item.deskripsi}</p>
            <p className="text-primary font-medium mt-1">
              {formatPrice(item.harga)}
            </p>
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
};

const ListDetail = () => {
  const params = useParams<ListDetailParams>();
  const { listId } = params;

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
        <ListItems id_kategori={listId} />
      </IonContent>
    </IonPage>
  );
};

export default ListDetail;