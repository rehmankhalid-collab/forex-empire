import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/reviews", label: "Reviews" },
];

export async function Nav() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0b]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e8b23d]/60 font-serif text-[#e8b23d]">
            FE
          </span>
          <span className="text-sm font-semibold tracking-wide text-zinc-100">
            FOREX EMPIRE
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-zinc-400 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-zinc-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden text-zinc-400 hover:text-zinc-100 sm:inline"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="hidden text-zinc-400 hover:text-zinc-100 sm:inline"
              >
                Dashboard
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="rounded-md border border-white/10 px-3 py-1.5 text-zinc-300 transition hover:border-white/20 hover:text-white">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-400 hover:text-zinc-100"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[#e8b23d] px-3 py-1.5 font-medium text-black transition hover:bg-[#f0c360]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
