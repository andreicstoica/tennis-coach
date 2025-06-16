export default function Footer() {
  return (
    <footer className="text-muted-foreground border-t border-green-200 pt-6 pb-2 text-center">
      <p>
        &copy; {new Date().getFullYear()} Personlized sessions to improve your
        game and reflect on progress.
      </p>
    </footer>
  );
}
