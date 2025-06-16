//import TennisCoachChat from "~/components/tennis-coach-chat";
import Link from "next/link";
import Footer from "~/components/footer";
import Header from "~/components/header";

export default function HomePage() {
  return (
    <div className="flex h-screen min-h-screen flex-col justify-between bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Header />

      <main className="flex flex-row gap-5">
        {/* <TennisCoachChat /> */}
        <Link href="/practice-session">Hello</Link>
        <Link href="/signin">Sign In</Link>
      </main>

      <Footer />
    </div>
  );
}
