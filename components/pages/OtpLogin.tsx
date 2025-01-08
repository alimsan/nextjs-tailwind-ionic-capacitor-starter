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
  IonSelect,
  IonSelectOption,
} from '@ionic/react';

const OtpLoginPage = () => {
  const emailRef = useRef<HTMLIonInputElement>(null);
  const teleponRef = useRef<HTMLIonInputElement>(null);
  const [email, setEmail] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [otpMethod, setOtpMethod] = useState('');
  const [isMethodSelected, setIsMethodSelected] = useState(false);

  const handleMethodChange = (value: string) => {
    setOtpMethod(value);
    setIsMethodSelected(true);
    // Reset nilai input ketika mengganti metode
    setEmail('');
    setNoTelepon('');
  };

  const validateForm = () => {
    const currentEmail = emailRef.current?.value?.toString() || '';
    const currentTelepon = teleponRef.current?.value?.toString() || '';

    if (otpMethod === 'email' && !currentEmail.trim()) {
      setToastMessage('Email tidak boleh kosong');
      setShowToast(true);
      return false;
    }
    if (otpMethod === 'telepon' && !currentTelepon.trim()) {
      setToastMessage('Nomor telepon tidak boleh kosong');
      setShowToast(true);
      return false;
    }
    return true;
  };

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const currentEmail = emailRef.current?.value?.toString() || '';
    const currentTelepon = teleponRef.current?.value?.toString() || '';

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    try {
      const requestBody = {
        otp: 'true',
        ...(otpMethod === 'email' 
          ? { email: currentEmail.trim() } 
          : { no_telepon: currentTelepon.trim() })
      };

      console.log('Request Body:', requestBody);

      const response = await fetch(`${apiUrl}/api/mitraresto/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('Response:', result);

      setLoading(false);

      if (result.status === 'success') {
        sessionStorage.setItem('otpMethod', otpMethod);
        sessionStorage.setItem('otpContact', otpMethod === 'email' ? currentEmail : currentTelepon);
        
        window.location.href = '/validation-otp';
      } else {
        setToastMessage(result.message || 'Gagal mengirim OTP');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      setToastMessage('Terjadi kesalahan. Silakan coba lagi.');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login dengan OTP</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleOtpRequest}>
          <IonItem>
            <IonLabel>Pilih Metode OTP</IonLabel>
            <IonSelect 
              value={otpMethod} 
              onIonChange={e => handleMethodChange(e.detail.value)}
              placeholder="Pilih metode"
            >
              <IonSelectOption value="email">Email</IonSelectOption>
              <IonSelectOption value="telepon">Nomor Telepon</IonSelectOption>
            </IonSelect>
          </IonItem>

          {isMethodSelected && (
            <>
              {otpMethod === 'email' ? (
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    ref={emailRef}
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value || '')}
                    type="email"
                    required
                  />
                </IonItem>
              ) : (
                <IonItem>
                  <IonLabel position="floating">Nomor Telepon</IonLabel>
                  <IonInput
                    ref={teleponRef}
                    value={noTelepon}
                    onIonInput={(e) => setNoTelepon(e.detail.value || '')}
                    type="tel"
                    required
                  />
                </IonItem>
              )}

              <IonButton 
                expand="block" 
                type="submit"
                className="mt-4"
                disabled={loading}
              >
                {loading ? 'Mengirim...' : 'Kirim OTP'}
              </IonButton>
            </>
          )}
        </form>

        <IonButton 
          expand="block" 
          fill="outline" 
          routerLink="/login"
          className="mt-4"
          disabled={loading}
        >
          Login dengan Password
        </IonButton>

        <IonLoading isOpen={loading} message="Mengirim OTP..." />
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

export default OtpLoginPage;