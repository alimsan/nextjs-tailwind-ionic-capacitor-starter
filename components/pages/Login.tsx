import React, { useState, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonLabel,
  IonItem,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import PouchDB from 'pouchdb';

const LoginPage = () => {
  const history = useHistory();
  const emailRef = useRef<HTMLIonInputElement>(null);
  const passwordRef = useRef<HTMLIonInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const db = new PouchDB('user_database');

  const validateForm = () => {
    const currentEmail = emailRef.current?.value?.toString() || '';
    const currentPassword = passwordRef.current?.value?.toString() || '';

    if (!currentEmail.trim()) {
      setToastMessage('Email tidak boleh kosong');
      setShowToast(true);
      return false;
    }

    if (!currentPassword.trim()) {
      setToastMessage('Password tidak boleh kosong');
      setShowToast(true);
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah form submit default
    
    if (!validateForm()) {
      return;
    }

    const currentEmail = emailRef.current?.value?.toString() || '';
    const currentPassword = passwordRef.current?.value?.toString() || '';

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      console.log('Login request:', { email: currentEmail }); // Log untuk debugging

      const response = await fetch(`${apiUrl}/api/mitraresto/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentEmail.trim(),
          password: currentPassword.trim(),
          reg_id: 'bas812899adada:AdWgXCKOFxE1im1KFmdxJWz6AzUIWlZBt10z4dswI4HC5DCDjmUhoG__Ooc7ku4-jO3HN_iLjOhedhA4PtF9oE8Fuv-sa',
        }),
      });

      const result = await response.json();
      console.log('Login response:', result); // Log untuk debugging

      setLoading(false);

      if (result.status === 'success') {
        await db.put({
          _id: 'user',
          id_user: result.data.id_user,
          token: result.token,
          lapak: result.data.lapak,
          telepon_penanggung_jawab: result.data.telepon_penanggung_jawab,
        });

        await db.put({
          _id: 'restoran',
          id_resto: result.restoran.id,
          nama_resto: result.restoran.nama_resto,
          alamat: result.restoran.alamat,
          foto_resto: result.restoran.foto_resto,
          kontak_telepon: result.restoran.kontak_telepon,
          reg_id: result.restoran.reg_id,
        });

        window.location.href = '/feed';
      } else {
        setToastMessage(result.message || 'Login gagal');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Login error:', error); // Log untuk debugging
      setLoading(false);
      setToastMessage('Terjadi kesalahan. Silakan coba lagi.');
      setShowToast(true);
    }
  };

  const handleOtpLogin = () => {
    history.push('/otplogin');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleLogin}>
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              ref={emailRef}
              value={email}
              onIonInput={(e) => setEmail(e.detail.value || '')}
              type="email"
              required
              autocomplete="email"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput
              ref={passwordRef}
              value={password}
              onIonInput={(e) => setPassword(e.detail.value || '')}
              type="password"
              required
              autocomplete="current-password"
            />
          </IonItem>

          <IonButton 
            expand="block" 
            type="submit"
            className="mt-4"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Login'}
          </IonButton>
        </form>

        <IonButton 
          expand="block" 
          fill="outline" 
          onClick={handleOtpLogin}
          className="mt-4"
          disabled={loading}
        >
          Login dengan OTP
        </IonButton>

        <IonLoading isOpen={loading} message="Memproses login..." />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;