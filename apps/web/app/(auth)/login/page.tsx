import { LoginForm } from 'components/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <>
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center">
          <span className="text-4xl font-bold text-gray-900">JobLess</span>
        </Link>
      </div>

      <LoginForm />
    </>
  );
}