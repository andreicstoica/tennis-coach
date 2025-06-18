import { SignupForm } from "~/components/signup-form";

export default function SignupPage() {
  return (
    <div className="bg-muted flex h-full flex-col items-center justify-center gap-6 p-6 md:p-10">
      <SignupForm />
    </div>
  );
}
