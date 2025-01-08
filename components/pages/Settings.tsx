import {
  IonPage,
  IonHeader,
  IonItem,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonToggle,
  IonButton,
  IonLoading,
  IonToast,
  IonFooter,
} from '@ionic/react';
import { useState } from 'react';
import PouchDB from 'pouchdb';
import Store from '../../store';
import * as selectors from '../../store/selectors';
import { setSettings } from '../../store/actions';

const Settings = () => {
  const settings = Store.useState(selectors.selectSettings);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const db = new PouchDB('user_database');

  const handleLogout = async () => {
    setLoading(true);
    try {
      await db.destroy();
      console.log('Semua data berhasil dihapus');
      window.location.href = '/otplogin';
    } catch (err) {
      console.error('Error saat menghapus data:', err);
    }
    /* try {
      // Hapus data user
      try {
        const userDoc = await db.get('user');
        await db.remove(userDoc);
      } catch (error) {
        console.log('User document sudah tidak ada atau error:', error);
      }

      // Hapus data restoran
      try {
        const restoDoc = await db.get('restoran');
        await db.remove(restoDoc);
      } catch (error) {
        console.log('Restoran document sudah tidak ada atau error:', error);
      }

      setLoading(false);
      // Redirect ke halaman login
      window.location.href = '/otplogin';
    } catch (error) {
      console.error('Error saat logout:', error);
      setLoading(false);
      setToastMessage('Terjadi kesalahan saat logout. Silakan coba lagi.');
      setShowToast(true);
    } */
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonToggle
              checked={settings.enableNotifications}
              onIonChange={e => {
                setSettings({
                  ...settings,
                  enableNotifications: e.target.checked,
                });
              }}
            >
              Enable Notifications
            </IonToggle>
          </IonItem>
          
          {/* <IonItem>
            <IonButton
              expand="block"
              color="danger"
              onClick={handleLogout}
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Logout'}
            </IonButton>
          </IonItem> */}
            
        </IonList>

        <IonLoading 
          isOpen={loading} 
          message="Memproses logout..." 
        />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
      <IonFooter>
            <IonButton
              expand="block"
              color="danger"
              onClick={handleLogout}
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Logout'}
            </IonButton>
      </IonFooter>
    </IonPage>
  );
};

export default Settings;