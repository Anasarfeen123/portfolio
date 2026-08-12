import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <span className="not-found-code">404 / Not Found</span>
      <h1 className="not-found-title">This route doesn&apos;t exist.</h1>
      <p className="not-found-copy">
        Whatever you were looking for isn&apos;t here. It might have moved, or the link was wrong.
      </p>
      <Link href="/" className="contact-vector" style={{ marginTop: 8 }}>
        <ArrowLeft size={15} /> Back home
      </Link>
    </div>
  );
}
