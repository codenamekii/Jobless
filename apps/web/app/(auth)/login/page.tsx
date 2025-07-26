import { LoginForm } from '@/components/auth/login-form';
import { BackgroundGradient } from '@/components/ui/background-gradient';

export default function LoginPage() {
  return (
    <BackgroundGradient className="rounded-[22px] max-w-md p-8 sm:p-10 bg-neutral-900 border border-neutral-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-neutral-400">Sign in to your JobLess account</p>
      </div>

      <LoginForm />
    </BackgroundGradient>
  );
}