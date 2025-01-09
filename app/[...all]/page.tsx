import dynamic from 'next/dynamic';
import { lists } from '../../mock';

const App = dynamic(() => import('../../components/AppShell'), {
  ssr: false,
});

export async function generateStaticParams() {
  return [
    { all: ['login'] },
    { all: ['otplogin'] },
    { all: ['validation-otp'] },
    { all: ['feed'] },
    { all: ['add-makanan'] },
    { all: ['lists'] },
    ...lists.map(list => ({ all: ['lists', list.id] })),
    { all: ['settings'] },
  ];
}

// Mengizinkan parameter dinamis untuk route /lists/[id]
export const dynamicParams = true;

export default function Page() {
  return <App />;
}