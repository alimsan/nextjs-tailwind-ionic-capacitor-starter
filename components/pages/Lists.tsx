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
  IonButton,
  IonIcon,
  IonButtons,
  IonAlert,
  IonModal,
  IonInput,
  IonText,
} from '@ionic/react';
import { pencil, trash, add } from 'ionicons/icons';
import { useRouter } from 'next/navigation';

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

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { id_restoran: string; menu_makanan: string }) => void;
  initialData: { id_restoran: string; menu_makanan: string } | null;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [menuName, setMenuName] = useState(initialData?.menu_makanan || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setMenuName(initialData.menu_makanan);
    }
  }, [initialData]);

  const handleSave = () => {
    if (!menuName.trim()) {
      setError('Nama menu tidak boleh kosong');
      return;
    }
    onSave({
      id_restoran: initialData?.id_restoran || '',
      menu_makanan: menuName
    });
    setError('');
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{initialData ? 'Edit Kategori Menu' : 'Tambah Kategori Menu'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Batal</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Nama Menu</IonLabel>
          <IonInput
            value={menuName}
            onIonChange={e => setMenuName(e.detail.value || '')}
            placeholder="Masukkan nama menu"
          />
        </IonItem>
        {error && (
          <IonText color="danger" className="ion-padding">
            <p>{error}</p>
          </IonText>
        )}
        <div className="ion-padding">
          <IonButton expand="block" onClick={handleSave}>
            Simpan
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

const ListEntry = ({ kategori, onEdit, onDelete }: { 
  kategori: KategoriMenu;
  onEdit?: (kategori: KategoriMenu) => void;
  onDelete?: (id: number) => void;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking edit/delete buttons
    if ((e.target as HTMLElement).closest('ion-button')) {
      e.preventDefault();
      return;
    }
  };

  return (
    <IonItem 
      routerLink={`/lists/${kategori.id}`} 
      className="list-entry"
      onClick={handleClick}
    >
      <IonLabel>{kategori.menu_makanan}</IonLabel>
      {onEdit && onDelete && (
        <IonButtons slot="end">
          <IonButton onClick={(e) => {
            e.preventDefault();
            onEdit(kategori);
          }}>
            <IonIcon icon={pencil} />
          </IonButton>
          <IonButton onClick={(e) => {
            e.preventDefault();
            onDelete(kategori.id);
          }}>
            <IonIcon icon={trash} />
          </IonButton>
        </IonButtons>
      )}
    </IonItem>
  );
};

const AllLists = () => {
  const [categories, setCategories] = useState<KategoriMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<KategoriMenu | null>(null);
  const db = new PouchDB('user_database');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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

  useEffect(() => {
    fetchCategories();
  }, []);
  const handleEdit = (kategori: KategoriMenu) => {
    setEditData(kategori);
    setShowEditModal(true);
  };
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteAlert(true);
  };


  const confirmDelete = async () => {
    if (deleteId) {
      try {
        const response = await fetch(`${apiUrl}/api/mitraresto/menu/destroy?id=${deleteId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        
        if (result.status === 'success') {
          setCategories(prev => prev.filter(cat => cat.id !== deleteId));
        }
      } catch (error) {
        setError('Gagal menghapus kategori');
      }
    }
    setShowDeleteAlert(false);
    setDeleteId(null);
  };

  const handleSaveEdit = async (data: KategoriMenu) => {
    try {
      const formData = new FormData();
      formData.append('id_restoran', data.id_restoran);
      formData.append('menu_makanan', data.menu_makanan);

      if (editData?.id) {
        formData.append('id', editData.id.toString());
      }

      const response = await fetch(`${apiUrl}/api/mitraresto/menumakanan/upcreate`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        setCategories(prev => 
          prev.map(cat => cat.id === editData?.id ? { ...cat, ...result.data } : cat)
        );
        setShowEditModal(false);
        setEditData(null);
      }
    } catch (error) {
      setError('Gagal menyimpan perubahan');
    }
  };

  if (isLoading) {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <IonItem key={i}>
            <IonLabel>
              <IonSkeletonText 
                animated={true} 
                style={{ width: '70%', height: '30px' }}
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
        <ListEntry 
          key={kategori.id} 
          kategori={kategori}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus kategori ini?"
        buttons={[
          {
            text: 'Batal',
            role: 'cancel'
          },
          {
            text: 'Hapus',
            handler: confirmDelete
          }
        ]}
      />

      <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit Kategori</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowEditModal(false)}>Tutup</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel position="stacked">Nama Menu</IonLabel>
            <IonInput
              value={editData?.menu_makanan}
              onIonChange={e => setEditData(prev => 
                prev ? { ...prev, menu_makanan: e.detail.value || '' } : null
              )}
            />
          </IonItem>
          <IonButton 
            expand="block" 
            className="ion-margin-top"
            onClick={() => editData && handleSaveEdit(editData)}
          >
            Simpan
          </IonButton>
        </IonContent>
      </IonModal>
    </>
  );
};

const Lists = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const db = new PouchDB('user_database');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleCreate = async (data: { id_restoran: string; menu_makanan: string }) => {
    try {
      const restoran = await db.get<Restoran>('restoran');
      const formData = new FormData();
      formData.append('id_restoran', restoran.id_resto);
      formData.append('menu_makanan', data.menu_makanan);

      const response = await fetch(`${apiUrl}/api/mitraresto/menumakanan/upcreate`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        // Refresh halaman atau update state
        window.location.reload();
      }
    } catch (error) {
      console.error('Gagal menambah kategori menu:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>Kategori Menu</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowCreateModal(true)}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
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

      <EditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        initialData={null}
      />
    </IonPage>
  );
};

export default Lists;