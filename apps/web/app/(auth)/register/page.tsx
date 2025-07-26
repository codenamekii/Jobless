import { RegisterForm } from '@/components/auth/register-form';
import { BackgroundGradient } from '@/components/ui/background-gradient';

export default function RegisterPage() {
  return (
    <BackgroundGradient className="rounded-[22px] max-w-md p-8 sm:p-10 bg-neutral-900 border border-neutral-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create an account</h1>
        <p className="text-neutral-400">Start tracking your job applications</p>
      </div>

      <RegisterForm />
    </BackgroundGradient>
  );
}