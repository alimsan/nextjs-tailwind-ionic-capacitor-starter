import React, { useState, useEffect } from 'react';
import PouchDB from 'pouchdb';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSkeletonText,
  IonSpinner,
} from '@ionic/react';

interface KategoriMenu {
  id: number;
  menu_makanan: string;
  id_restoran: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: KategoriMenu[];
}

type Restoran = {
  _id: string;
  _rev?: string;
  id_resto: string;
  nama_resto: string;
  alamat: string;
  foto_resto: string;
  kontak_telepon: string;
  reg_id: string;
};

const ListEntry = ({ kategori }: { kategori: KategoriMenu }) => {
  return (
    <IonItem 
      routerLink={`/lists/${kategori.id}`} 
      className="list-entry"
    >
      <IonLabel>{kategori.menu_makanan}</IonLabel>
    </IonItem>
  );
};

const AllLists = () => {
  const [categories, setCategories] = useState<KategoriMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = new PouchDB('user_database');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const restoran = await db.get<Restoran>('restoran');
        const response = await fetch(`${apiUrl}/api/mitraresto/kategori/menu?id_resto=${restoran.id_resto}`);
        const data: ApiResponse = await response.json();
        
        if (data.status === 'success') {
          setCategories(data.data);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError('Gagal memuat kategori menu');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <IonItem key={i}>
            <IonLabel>
              <IonSkeletonText 
                animated={true} 
                style={{ width: '70%', height: '20px' }}
              />
            </IonLabel>
          </IonItem>
        ))}
      </>
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
    <>
      {categories.map((kategori) => (
        <ListEntry key={kategori.id} kategori={kategori} />
      ))}
    </>
  );
};

const Lists = () => {
  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>Kategori Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen={true}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Kategori Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          <AllLists />
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Lists;