import Image from "next/image";
import Link from "next/link";
import { SigninForm } from "~/components/signin-form";
import logo from "~/../public/logo.png";

export default function SigninPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center text-xl font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Image src={logo} alt="logo" width={50} height={50} />
          </div>
          Courtly
        </Link>
        <SigninForm />
      </div>
    </div>
  );
}
