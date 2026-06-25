import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const PrivacyPolicy = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className="
        relative flex flex-col justify-center items-center
        min-h-screen px-6 py-20 text-center 
        bg-cover bg-center bg-no-repeat
        before:content-[''] before:absolute before:inset-0
       before:bg-[linear-gradient(180deg,#000000ff_1%,#000000b3_25%,#00000000_135%,#ffffffff_150%)]


      "
      style={{ backgroundImage: "url('/images/hero_img.webp')" }}
    >
      {/* Navbar */}
      <nav className="absolute top-2 sm:top-4 left-0 w-full z-30 flex items-center justify-between px-8 sm:px-16 lg:px-24 py-4 sm:py-6 text-white font-semibold">
        {/* Left links (desktop) */}
        <div className="hidden md:flex items-center space-x-12 sm:space-x-16">
          <Link href="/" className="hover:text-gray-300 text-[20px] font-medium font-outfit transition">Home</Link>
          <Link href="/#services-section" className="hover:text-gray-300 text-[20px] font-medium font-outfit transition">Services</Link>
        </div>

        {/* Center logo */}
        <Link href='/' className="absolute left-1/2 mt-10 -translate-x-1/2 top-6 sm:top-8">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight" style={{
            background: 'linear-gradient(135deg, #c9a84c 0%, #f0d06e 40%, #d4a843 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'Playfair Display', serif",
          }}>
            DriveElite
          </span>
        </Link>

        {/* Right links (desktop) */}
        <div className="hidden md:flex items-center space-x-12 sm:space-x-16">
          <Link href="/#contact" className="hover:text-gray-300 text-[20px] font-medium font-outfit transition">Contact</Link>
          <Link href="/booking" className="hover:text-gray-300 text-[20px] font-medium font-outfit transition">Book</Link>
        </div>

       {/* Mobile Hamburger */}
<div className="md:hidden absolute top-8 right-4 sm:top-6 sm:right-8 z-40">
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="focus:outline-none"
  >
    {isOpen ? <X size={28} /> : <Menu size={28} />}
  </button>
</div>


        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-black bg-opacity-90 flex flex-col items-center py-6 space-y-4 md:hidden z-20">
            <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-gray-300 transition text-lg font-semibold">Home</Link>
            <Link href="/#services-section" onClick={() => setIsOpen(false)} className="hover:text-gray-300 transition text-lg font-semibold">Services</Link>
            <Link href="/#contact" onClick={() => setIsOpen(false)} className="hover:text-gray-300 transition text-lg font-semibold">Contact</Link>
            <Link href="/booking" onClick={() => setIsOpen(false)} className="hover:text-gray-300 px-4 py-1 text-black p-2 rounded-full bg-white transition text-lg font-semibold">Book</Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
    <div className="relative max-w-5xl mx-auto mt-32 sm:mt-44 px-6 text-gray-200">
  <h2 className="text-3xl sm:text-4xl font-semibold mb-6 text-gradient text-center">
    PRIVACY POLICY
  </h2>

  <p
    className="mb-4 text-center text-white"
    style={{
      fontFamily: "Outfit",
      fontWeight: 400,
      fontSize: "20px",
      lineHeight: "120%",
      letterSpacing: "0%",
    }}
  >
    At <span>DRIVEELITE</span>, we respect your privacy and are committed
    to protecting your personal information. This Privacy Policy outlines how we
    collect, use, and safeguard your data when you use our services or visit our
    website.
  </p>

  <p
    className="mb-4 text-center text-white leading-relaxed"
    style={{
      fontFamily: "Outfit",
      fontWeight: 400,
      fontSize: "20px",
      lineHeight: "120%",
      letterSpacing: "0%",
    }}
  >
    We collect personal information, including your name, contact information, and
    booking details, to provide you with our transport services. We do not share your
    personal data with third parties except as necessary to fulfill your reservation or
    comply with legal obligations. By using our website and services, you consent to
    our collection and use of your information as described in this policy. If you have
    any concerns about your privacy, please contact us at <br />
    <a
      href="mailto:himanshu2006f@gmail.com"
      className="underline hover:text-gray-300"
      style={{
        fontFamily: "Outfit, sans-serif",
        fontWeight: 400,
        fontSize: "20px",
        textDecorationStyle: "solid",
        textDecorationThickness: "0%",
        textDecorationSkipInk: "auto",
      }}
    >
     himanshu2006f@gmail.com
    </a>
  </p>
  {/* <div className="flex justify-center ">
    <button
            onClick={() => {
              const phoneNumber = "9145358870"; // No "+" sign
              const message = encodeURIComponent("Hello! I want to chat about booking a ride.");
              const url = `https://wa.me/${phoneNumber}?text=${message}`;
              window.open(url, "_blank");
            }}
            className="flex items-center gap-2 mt-3 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full mb-2 font-semibold transition duration-200"
          >
            <FaWhatsapp className="text-white text-xl" />Message Us Instantly
          </button>
  </div> */}
</div>

    </section>
  );
};

// Prevent global header/footer from rendering
PrivacyPolicy.noFooter = true;
PrivacyPolicy.noHeader = true;

export default PrivacyPolicy;
