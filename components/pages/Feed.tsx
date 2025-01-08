import { useEffect } from 'react';
import PouchDB from 'pouchdb';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonMenuButton,
} from '@ionic/react';
import { useState } from 'react';
import { notificationsOutline } from 'ionicons/icons';
import Notifications from './Notifications';
import TransactionTable from '../ui/TransactionTable';
type Restoran = {
  _id: string;
  _rev?: string;
  id_resto:string;
  nama_resto: string;
  alamat: string;
  foto_resto: string;
  kontak_telepon: string;
  reg_id: string;
};
const Feed = () => {
  const history = useHistory();
  const db = new PouchDB('user_database');
  const [namaResto, setNamaResto] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await db.get('user');
        if (!user) {
          history.push('/login'); // Redirect to login if no user found
        }else{
          const restoran = await db.get<Restoran>('restoran');
          if (restoran && restoran.nama_resto) {
            setNamaResto(restoran.nama_resto);
          }
        }
      } catch (error) {
        history.push('/login'); // Redirect to login on error
      }
    };

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Transaksi {namaResto}</IonTitle>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowNotifications(true)}>
              <IonIcon icon={notificationsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Transaksi</IonTitle>
          </IonToolbar>
        </IonHeader>
        <Notifications
          open={showNotifications}
          onDidDismiss={() => setShowNotifications(false)}
        />
        <div className="max-w-full overflow-x-auto">
          <TransactionTable />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Feed;
