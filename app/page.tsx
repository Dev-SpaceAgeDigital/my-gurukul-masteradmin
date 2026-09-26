import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('master_token');

  if (token && token.value) {
    redirect('/master/dashboard');
  } else {
    redirect('/master/login');
  }
}
