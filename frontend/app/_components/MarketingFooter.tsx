import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="w-full border-t border-black/5 bg-surface py-16">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-10 px-6 sm:px-8 md:flex-row lg:px-10">
        <div className="max-w-sm space-y-4">
          <div className="text-xl font-bold text-primary">Dakshya</div>
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Dakshya. Bridging the gap between degree and
            career for Nepal&apos;s university students.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-8">
          <div className="space-y-4">
            <h5 className="text-sm font-bold text-primary">Platform</h5>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-bold text-primary">Company</h5>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  Sign up
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
