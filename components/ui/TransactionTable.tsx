import React, { useState, useEffect } from 'react';
import PouchDB from 'pouchdb';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonModal,
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
} from '@ionic/react';
import { close } from 'ionicons/icons';

interface Transaction {
  id_transaksi: number;
  biaya_akhir: number;
  jarak: number;
  alamat_asal: string;
  alamat_tujuan: string;
  status: number;
  nama_depan: string;
  nama_belakang: string;
  id_pelanggan: string;
  id_driver: string;
  foto_struk: string;
}

interface ApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: Transaction[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
  totalMenu: number;
  totalKategoriMenu: number;
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

const TransactionTable = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMenu, setTotalMenu] = useState(0);
  const [totalKategoriMenu, setTotalKategoriMenu] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const db = new PouchDB('user_database');
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const storageUrl = `${apiUrl}/storage/asset/berkas_mmart_mfood/foto_struk/`;

  const fetchTransactions = async (page: number) => {
    setIsLoading(true);
    try {
      const restoran = await db.get<Restoran>('restoran');
      const response = await fetch(`${apiUrl}/api/mitraresto/transaksi?page=${page}&id_resto=${restoran.id_resto}`);
      const data: ApiResponse = await response.json();
      setTransactions(data.data);
      setTotalPages(data.last_page);
      setCurrentPage(data.current_page);
      setTotalMenu(data.totalMenu);
      setTotalKategoriMenu(data.totalKategoriMenu);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const getStatusLabel = (status: number): string => {
    const labels: Record<number, string> = {
      1: "Mencari",
      2: "Menawar",
      3: "Berhasil",
      4: "Ditolak",
      5: "Dibatalkan",
      6: "Memulai",
      7: "Selesai",
    };
    return labels[status] || "Unknown";
  };

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const getStrukUrl = (filename: string) => {
    return `${storageUrl}${filename}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
        ))}
      </div>
    );
  }

  return (
    <div>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonCard className="text-center">
              <IonCardContent>
                <div className="text-2xl font-bold text-primary">{totalMenu}</div>
                <div className="text-sm text-gray-500">Menu</div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol>
            <IonCard className="text-center">
              <IonCardContent>
                <div className="text-2xl font-bold text-primary">{totalKategoriMenu}</div>
                <div className="text-sm text-gray-500">Kategori Menu</div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-sm text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="py-3 px-6">ID Transaksi</th>
              <th className="py-3 px-6">Biaya Akhir</th>
              <th className="py-3 px-6">Jarak (KM)</th>
              <th className="py-3 px-6">Alamat Asal</th>
              <th className="py-3 px-6">Alamat Tujuan</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr 
                key={transaction.id_transaksi} 
                className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => handleRowClick(transaction)}
              >
                <td className="py-3 px-6">{transaction.id_transaksi}</td>
                <td className="py-3 px-6">Rp {transaction.biaya_akhir.toLocaleString()}</td>
                <td className="py-3 px-6">{transaction.jarak.toFixed(2)}</td>
                <td className="py-3 px-6 truncate max-w-xs">{transaction.alamat_asal}</td>
                <td className="py-3 px-6 truncate max-w-xs">{transaction.alamat_tujuan}</td>
                <td className="py-3 px-6">{getStatusLabel(transaction.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center gap-2 mt-4">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50 text-gray-700 dark:text-gray-300"
          >
            Previous
          </button>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50 text-gray-700 dark:text-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Detail Transaksi</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setIsModalOpen(false)}>
              <IonIcon icon={close} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">ID Transaksi</h3>
                  <p>{selectedTransaction.id_transaksi}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <p>{getStatusLabel(selectedTransaction.status)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Biaya Akhir</h3>
                  <p>Rp {selectedTransaction.biaya_akhir.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Jarak</h3>
                  <p>{selectedTransaction.jarak.toFixed(2)} KM</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold">Alamat Asal</h3>
                  <p>{selectedTransaction.alamat_asal}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold">Alamat Tujuan</h3>
                  <p>{selectedTransaction.alamat_tujuan}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Nama Pelanggan</h3>
                  <p>{`${selectedTransaction.nama_depan} ${selectedTransaction.nama_belakang}`}</p>
                </div>
                <div>
                  <h3 className="font-semibold">ID Driver</h3>
                  <p>{selectedTransaction.id_driver}</p>
                </div>
                {selectedTransaction.foto_struk && (
                  <div className="col-span-2">
                    <h3 className="font-semibold mb-2">Foto Struk</h3>
                    <img 
                      src={getStrukUrl(selectedTransaction.foto_struk)} 
                      alt="Struk" 
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </IonContent>
      </IonModal>
    </div>
  );
};

export default TransactionTable;