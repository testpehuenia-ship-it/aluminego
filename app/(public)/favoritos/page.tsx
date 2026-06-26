import { Metadata } from 'next';
import FavoritosClient from './FavoritosClient';

export const metadata: Metadata = {
  title: 'Mis Favoritos | AluminéGO',
  description: 'Revisa todos tus alojamientos, restaurantes y comercios guardados en Aluminé.',
};

export default function FavoritosPage() {
  return (
    <main style={{ minHeight: '80vh', backgroundColor: '#f8fafc' }}>
      <FavoritosClient />
    </main>
  );
}

