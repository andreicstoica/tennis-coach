import { SigninForm } from "~/components/signin-form";

export default function SigninPage() {
  return (
    <div className="bg-muted flex h-full flex-col items-center justify-center gap-6 p-6 md:p-10">
      <SigninForm />
    </div>
  );
}
