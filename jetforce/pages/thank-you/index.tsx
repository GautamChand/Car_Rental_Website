import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const ThankYou = () => {
  const router = useRouter();
  const { bookingId } = router.query;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative
        bg-center bg-no-repeat bg-cover
        before:content-[''] before:absolute before:top-0 before:left-0 
        before:w-full before:h-full before:bg-black/60"
      style={{ backgroundImage: 'url("/images/hero_img.webp")' }}
    >
      <div className="relative text-white text-center max-w-[600px] mx-auto px-4 w-full">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Booking Confirmed!
        </h1>

        <p className="text-lg sm:text-xl mb-4 text-white/80">
          Your ride has been successfully booked. We will be in touch soon with
          more details.
        </p>

        {bookingId && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 mb-8 border border-white/20 inline-block">
            <p className="text-sm text-white/60 mb-1">Booking Reference</p>
            <p className="text-2xl font-bold font-mono tracking-wider">
              {bookingId}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-white text-black hover:bg-gray-100 transition-colors font-semibold rounded-lg text-sm sm:text-base px-6 py-3"
          >
            Back to Homepage
          </Link>
          <Link
            href="/bookings"
            className="inline-flex items-center justify-center bg-transparent text-white border border-white/40 hover:bg-white/10 transition-colors font-semibold rounded-lg text-sm sm:text-base px-6 py-3"
          >
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

ThankYou.noHeader = true;
ThankYou.noFooter = true;

export default ThankYou;