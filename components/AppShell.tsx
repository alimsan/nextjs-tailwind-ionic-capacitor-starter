'use client';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Switch, Redirect } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PouchDB from 'pouchdb';

import Tabs from './pages/Tabs';
import Login from './pages/Login';
import OtpLogin from './pages/OtpLogin';
import ValidationOtpPage from './pages/ValidationOtp';
import AddMakanan from './pages/AddMakanan';

setupIonicReact({});

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', async status => {
    try {
      await StatusBar.setStyle({
        style: status.matches ? Style.Dark : Style.Light,
      });
    } catch {}
  });

const AppShell = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const db = new PouchDB('user_database');
      try {
        await db.get('user');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id="main">
          {!isAuthenticated ? (
            <Switch>
              <Route path="/login" component={Login} exact />
              <Route path="/otplogin" component={OtpLogin} exact />
              <Route path="/validation-otp" component={ValidationOtpPage} exact />
              <Redirect from="/" to="/otplogin" exact />
              <Redirect from="*" to="/otplogin" />
            </Switch>
          ) : (
            <Switch>
              <Route path="/feed" component={Tabs} />
              <Route path="/lists" component={Tabs} />
              <Route path="/add-makanan" component={AddMakanan} />
              <Route path="/lists/:listId" component={Tabs} />
              <Route path="/settings" component={Tabs} />
              <Redirect from="/" to="/feed" exact />
              <Redirect from="/login" to="/feed" />
              <Redirect from="/otplogin" to="/feed" />
              <Redirect from="/validation-otp" to="/feed" />
              <Redirect from="*" to="/feed" />
            </Switch>
          )}
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default AppShell;