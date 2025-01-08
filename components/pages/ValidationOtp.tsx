import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
  IonText,
} from '@ionic/react';
import PouchDB from 'pouchdb';

const ValidationOtpPage = () => {
  const history = useHistory();
  const otpRef = useRef<HTMLIonInputElement>(null);
  const [otpData, setOtpData] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [otpMethod, setOtpMethod] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showMethodSelect, setShowMethodSelect] = useState(false);
  const db = new PouchDB('user_database');

  useEffect(() => {
    // Mengambil data dari sessionStorage
    const method = sessionStorage.getItem('otpMethod');
    const contact = sessionStorage.getItem('otpContact');
    const lastResendTime = sessionStorage.getItem('lastResendTime');

    if (!method || !contact) {
      history.push('/otplogin');
      return;
    }

    setOtpMethod(method);
    setContactInfo(contact);

    // Check waktu terakhir resend
    if (lastResendTime) {
      const timeDiff = new Date().getTime() - new Date(lastResendTime).getTime();
      const waitTime = 8 * 60 * 1000; // 8 menit dalam milliseconds
      
      if (timeDiff < waitTime) {
        setResendDisabled(true);
        setTimeLeft(Math.ceil((waitTime - timeDiff) / 1000));
      }
    }
  }, [history]);

  // Timer countdown untuk resend
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setResendDisabled(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft]);

  const validateForm = () => {
    const currentOtp = otpRef.current?.value?.toString() || '';
    
    if (!currentOtp.trim()) {
      setToastMessage('Kode OTP tidak boleh kosong');
      setShowToast(true);
      return false;
    }

    if (currentOtp.length !== 6) {
      setToastMessage('Kode OTP harus 6 digit');
      setShowToast(true);
      return false;
    }

    return true;
  };

  const handleValidateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const currentOtp = otpRef.current?.value?.toString() || '';

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    try {
      const requestBody = {
        reg_id: 'bas812899adada:AdWgXCKOFxE1im1KFmdxJWz6AzUIWlZBt10z4dswI4HC5DCDjmUhoG__Ooc7ku4-jO3HN_iLjOhedhA4PtF9oE8Fuv-sa',
        otp_code: currentOtp,
        ...(otpMethod === 'email' 
          ? { email: contactInfo } 
          : { no_telepon: contactInfo })
      };

      const response = await fetch(`${apiUrl}/api/mitraresto/validotp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      setLoading(false);

      if (result.status === 'success') {
        // Hapus data sessionStorage
        sessionStorage.removeItem('otpMethod');
        sessionStorage.removeItem('otpContact');
        sessionStorage.removeItem('lastResendTime');

        // Simpan data ke PouchDB
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
        setToastMessage(result.message || 'Validasi OTP gagal');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      setToastMessage('Terjadi kesalahan. Silakan coba lagi.');
      setShowToast(true);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    try {
      const requestBody = {
        otp: 'true',
        ...(otpMethod === 'email' 
          ? { email: contactInfo } 
          : { no_telepon: contactInfo })
      };

      const response = await fetch(`${apiUrl}/api/mitraresto/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Set timer untuk 8 menit
        setResendDisabled(true);
        setTimeLeft(8 * 60); // 8 menit dalam detik
        sessionStorage.setItem('lastResendTime', new Date().toISOString());
        
        setToastMessage('Kode OTP baru telah dikirim');
        setShowToast(true);
      } else {
        setToastMessage(result.message || 'Gagal mengirim ulang OTP');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setToastMessage('Terjadi kesalahan saat mengirim ulang OTP');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Format waktu ke format MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Validasi OTP</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {contactInfo && (
          <IonText color="medium" className="ion-padding-bottom">
            <p className="ion-text-center">
              Masukkan kode OTP yang telah dikirim ke {otpMethod === 'email' ? 'email' : 'nomor'} {contactInfo}
            </p>
          </IonText>
        )}

        <form onSubmit={handleValidateOtp}>
          <IonItem>
            <IonLabel position="floating">Kode OTP</IonLabel>
            <IonInput
              ref={otpRef}
              value={otpData}
              onIonInput={(e) => setOtpData(e.detail.value || '')}
              type="number"
              maxlength={6}
              placeholder="Masukkan 6 digit kode OTP"
              required
            />
          </IonItem>

          <IonButton 
            expand="block" 
            type="submit"
            className="mt-4"
            disabled={loading}
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
          </IonButton>
        </form>

        <IonButton 
          expand="block" 
          fill="outline" 
          onClick={handleResendOtp}
          className="mt-4"
          disabled={resendDisabled || loading}
        >
          {resendDisabled 
            ? `Kirim Ulang OTP (${formatTime(timeLeft)})` 
            : 'Kirim Ulang OTP'}
        </IonButton>

        <IonLoading isOpen={loading} message={loading ? 'Memproses...' : undefined} />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default ValidationOtpPage;