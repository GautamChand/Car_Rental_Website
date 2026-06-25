import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import '../styles/auth.css';
import '../styles/admin.css';
import '../styles/profile.css';
import '../styles/bookings.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Montserrat } from 'next/font/google';
import 'tailwindcss/tailwind.css'
import { AuthProvider } from '../context/AuthContext';
import Script from 'next/script';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat',
});

const IS_WEBSITE_AVAILABLE = process.env.NEXT_PUBLIC_IS_WEBSITE_DOWN === "true"

// Extend AppProps to include optional noHeader and noFooter flags
type AppPropsWithLayout = AppProps & {
  Component: AppProps['Component'] & {
    noHeader?: boolean;
    noFooter?: boolean;
  }
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const CITY = "Dehradun, Uttarakhand"
  return (
    <>
      <Head>
        <title>{`DriveElite | Private Transportation in ${CITY} | Airport & Chauffeur Service`}</title>
        <meta name="description" content="Where Every Ride Feels Like Home and Family — Premium private transportation, airport transfers, and chauffeur services." />
        <meta name="Keywords" content={`private transportation, private driver, chauffeur service, airport transfer, airport ride, cab booking, ride booking, executive transportation, luxury transportation, hourly chauffeur, event transportation, wedding transportation, business transportation, airport car service, local transportation service, professional driver, private rides, private transportation in ${CITY}, airport transfer in ${CITY}, chauffeur service in ${CITY}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Razorpay Checkout Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <AuthProvider>
        {!IS_WEBSITE_AVAILABLE ? (
          <div className={`bg-grayCustom flex flex-col min-h-screen ${montserrat.className}`}>

            {/* Render Header only if noHeader is not set */}
            {!Component.noHeader && <Header />}

            <main className="flex-grow">
              <Component {...pageProps} />
            </main>

            {/* Render Footer only if noFooter is not set */}
            {!Component.noFooter && <Footer />}

          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 md:p-10">
            <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center">
              <img
                src="/images/down.png"
                alt="We'll be back soon"
                className="w-24 mb-6 animate-float"
              />
              <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-blue-600 text-center leading-snug">
                THIS WEBSITE <br /> CURRENTLY NOT AVAILABLE!
              </h1>
            </div>
          </div>
        )}
      </AuthProvider>
    </>
  );
}

export default MyApp;
