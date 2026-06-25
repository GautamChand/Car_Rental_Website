"use client";
import { Pencil } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/utils/helper";
import { withoutAuthAxios, withAuthAxios } from "@/services/config";

interface TaxiItem {
  carType: string;
  totalPrice: number;
  pickUpAddress: string;
  dropOffAddress: string;
  pickUpDate: string;
  selectTime: string;
}

interface TaxiItemsProps {
  showTaxiItems: boolean;
  setShowTaxiItems: React.Dispatch<React.SetStateAction<boolean>>;
  texiData: TaxiItem[];
  submittedData: FormData | any;
  setLoading: (isComponentLoading: boolean) => void;
}

const TaxiItems: React.FC<TaxiItemsProps> = ({
  showTaxiItems,
  texiData,
  setShowTaxiItems,
  submittedData,
  setLoading,
}) => {
  const [selectedTaxi, setSelectedTaxi] = useState<TaxiItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Refs for scrolling
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // Auto-scroll to Step 1 when component mounts
  useEffect(() => {
    if (showTaxiItems && step1Ref.current) {
      step1Ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showTaxiItems]);

  // Auto-scroll to Step 2 when taxi data is available
  useEffect(() => {
    if (showTaxiItems && texiData.length > 0 && step2Ref.current) {
      setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [showTaxiItems, texiData]);

  // Auto-scroll to Step 3 when form opens
  useEffect(() => {
    if (isOpen && selectedTaxi && step3Ref.current) {
      setTimeout(() => {
        step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [isOpen, selectedTaxi]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookNow = async (taxi: TaxiItem) => {
    if (!taxi || !submittedData) return;

    setPaymentError("");

    const reservationDetails = {
      pickup: submittedData?.formattedPickUpAddress,
      destination: submittedData?.formattedDropOffAddress,
      date: submittedData?.pickUpDate,
      time: submittedData?.selectTime,
      airlinename: submittedData?.airlinename,
      flightnumber: submittedData?.flightnumber,
      hourlyservice: submittedData?.hourlyservice,
      rideOption: submittedData?.rideOption,
      numberPassengers: submittedData?.numberPassengers,
      seatOption: submittedData?.seatOption,
      carChoice: taxi?.carType,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
    };

    const totalAmount = taxi.totalPrice;

    try {
      setLoading(true);

      // Step 1: Create Razorpay order
      const orderResponse = await withoutAuthAxios().post(
        "/payment/create-order",
        { amount: totalAmount }
      );

      const order = orderResponse.data.order;

      if (!order || !order.id) {
        throw new Error("Failed to create payment order");
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "DriveElite — Gautam & Himanshu",
        description: `${taxi.carType} — ${submittedData?.rideOption || "Ride"}`,
        order_id: order.id,
        handler: async function (response: any) {
          // Step 3: Verify payment on server
          try {
            setLoading(true);
            const verifyResponse = await withAuthAxios().post(
              "/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                reservationDetails,
                amount: totalAmount,
              }
            );

            if (verifyResponse.data.success) {
              const bookingId = verifyResponse.data.data?.bookingId || "";
              window.location.href = `/thank-you?bookingId=${bookingId}`;
            } else {
              setPaymentError("Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch (verifyError: any) {
            console.error("Payment verification error:", verifyError);
            setPaymentError(
              verifyError.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
            setLoading(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#1a1a2e",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        setPaymentError(
          response.error?.description || "Payment failed. Please try again."
        );
        setLoading(false);
      });
      razorpay.open();
    } catch (error: any) {
      console.error("Error during payment:", error);
      setPaymentError(
        error.response?.data?.message ||
          "Unable to process payment. Please try again."
      );
      setLoading(false);
    }
  };

  // Vehicle image mapping
  const getVehicleImage = (carType: string): string => {
    const type = carType.toLowerCase();
    const imageMap: Record<string, string> = {
      volvo: "/images/volvo.png",
      "black suburban 2024": "/images/blacksuburban2024.png",
      "black suburban 2026": "/images/blacksuburban2026.png",
      "black suburban 2020": "/images/blacksuburban2020.png",
      "black chevy tahoe 2024": "/images/chevytahoe.png",
      "chevrolet suburban 2021": "/images/chevroletsuburban.png",
      "chevrolet suburban rst": "/images/chevroletsuburbanrst.png",
      "black chevrolet suburban high": "/images/chevroletsuburbanhigh.png",
    };
    return imageMap[type] || "/images/car.png";
  };

  if (!showTaxiItems) return null;

  return (
    <div className="w-full min-h-screen bg-white">
      {/* STEP 1: Ride Info */}
      <div
        ref={step1Ref}
        className="bg-white overflow-hidden scroll lg:m-0 md:m-0 m-3"
      >
        <div className="flex flex-row w-[100%] rounded-[15px] justify-start lg:justify-between items-center bg-[#DCDCDC] py-5 px-4 lg:px-12 gap-12">
          <div className="flex items-center lg:mx-20 md:mx-20 justify-start sm:justify-start gap-3 text-center sm:text-left w-[70%]">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input
                type="radio"
                checked
                readOnly
                className="appearance-none w-5 h-5 border-2 border-black rounded-full checked:bg-black checked:border-black"
              />
              <div className="absolute w-2 h-2 bg-white rounded-full"></div>
            </div>
            <h2 className="text-center sm:text-left text-[18px] sm:text-[20px] font-semibold gradient-text">
              <span className="font-extrabold font-outfit">STEP 1 :</span>{" "}
              <span className="font-medium font-outfit">Ride Info</span>
            </h2>
          </div>

          <button
            onClick={() => setShowTaxiItems(false)}
            className="flex items-center lg:mx-20 md:mx-20 justify-end text-gray-800 hover:text-blue-600 transition w-[30%]"
          >
            <Pencil className="w-4 h-4 mr-2" />
            <span className="font-semibold font-outfit text-[20px]">Edit</span>
          </button>
        </div>

        {/* Ride Info Content */}
        <div className="p-6 sm:p-8 lg:px-12 flex flex-col lg:flex-row justify-between items-center lg:items-start gap-6 lg:gap-12 w-full">
          <div className="flex flex-col gap-3 items-center lg:items-start text-center lg:text-left w-full lg:w-1/2">
            <div className="flex flex-wrap mx-20 items-center justify-center lg:justify-start gap-6 text-gray-700">
              <p className="font-extrabold text-[28px] text-black">
                {submittedData?.pickUpDate || "-"}
              </p>
              <p className="font-extrabold text-[28px] text-black">
                {submittedData?.selectTime || "-"}
              </p>
            </div>
            <p className="flex items-center font-light mx-20 text-[20px] font-outfit text-black justify-center lg:justify-start">
              Passengers:
              <span className="font-light text-[20px] font-outfit text-black ml-1">
                {submittedData?.numberPassengers || "—"}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-6 text-gray-700 text-sm w-full lg:w-1/2">
            <div className="flex items-center gap-2 justify-center lg:justify-start text-black break-words">
              <img
                src="/images/location.png"
                alt="pickup"
                className="h-6 w-6 flex-shrink-0"
              />
              <span className="text-[20px] font-outfit font-light">
                {submittedData?.formattedPickUpAddress || "-"}
              </span>
            </div>

            <div className="flex items-center gap-2 justify-center lg:justify-start text-black break-words">
              <img
                src="/images/location_2.png"
                alt="dropoff"
                className="h-6 w-6 flex-shrink-0"
              />
              <span className="text-[20px] font-outfit font-light">
                {submittedData?.formattedDropOffAddress || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: Vehicle Selection */}
      <div className="mt-8 scroll-mt-4">
        <div className="w-[95%] md:w-full mx-auto mt-8 bg-transparent rounded-lg overflow-hidden">
          <div className="flex justify-start lg:justify-between items-center bg-[#DCDCDC] px-4 md:px-20 lg:px-20 py-6 rounded-[15px] flex-wrap">
            <div className="flex items-center lg:mx-11 gap-2 mx-1">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input
                  type="radio"
                  checked
                  readOnly
                  className="appearance-none w-5 h-5 border-2 border-black rounded-full checked:bg-black checked:border-black"
                />
                <div className="absolute w-2 h-2 bg-white rounded-full"></div>
              </div>
              <h2 className="flex items-center text-xs sm:text-sm md:text-base font-semibold gradient-text whitespace-nowrap">
                <span className="font-extrabold text-[16px] sm:text-[18px] md:text-[20px] font-outfit mr-1">
                  STEP 2 :
                </span>
                <span className="font-outfit font-medium text-[16px] sm:text-[18px] md:text-[20px]">
                  Select Vehicle
                </span>
              </h2>
            </div>
          </div>

          {/* Vehicle Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 lg:grid-cols-3 gap-6 p-6 justify-items-center">
            {texiData.map((taxi, index) => (
              <div
                key={index}
                className={`flex flex-col items-center border bg-white rounded-xl p-8 w-full max-w-sm transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${
                  selectedTaxi?.carType === taxi.carType
                    ? "border-black shadow-lg ring-2 ring-black/20"
                    : "border-black md:border-0"
                }`}
                onClick={() => {
                  setSelectedTaxi(taxi);
                  setIsOpen(true);
                }}
              >
                {/* Vehicle Image */}
                <div className="relative w-full h-28 lg:h-44 mb-8">
                  <Image
                    src={getVehicleImage(taxi.carType)}
                    width={500}
                    height={500}
                    alt={taxi.carType}
                    className="object-contain"
                  />
                </div>

                {/* Info Section */}
                <div className="flex justify-center gap-4 sm:gap-6 mt-10 lg:mt-1 md:mt-10 text-gray-700">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-md">
                    <div className="border bg-[#D0D0D0] border-black rounded-md p-1">
                      <img
                        src="/images/sitting.png"
                        alt="sitting man"
                        className="w-4 h-4"
                      />
                    </div>
                    <span className="inline-flex items-center text-[19px] font-outfit text-black bg-[#D0D0D0] justify-center text-sm h-6 w-6 border border-black rounded-md font-medium">
                      {submittedData?.numberPassengers}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="flex items-center justify-center h-6 w-6 bg-[#D0D0D0] border border-black rounded-md">
                      <img
                        src="/images/brifcase.png"
                        alt="briefcase"
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-center h-6 w-6 bg-[#D0D0D0] border border-black rounded-md">
                      <span className="text-sm font-outfit text-[19px] text-black font-medium">
                        5
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[#006F14] mt-3 text-[32px] font-extrabold text-xl mb-3">
                  {formatPrice(taxi.totalPrice)}
                </p>
                <span className="text-[12px] font-extrabold text-black mb-2 text-center">
                  {taxi.carType}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTaxi(taxi);
                    setIsOpen(true);
                  }}
                  className="px-12 py-2 bg-gradient text-white rounded-2xl font-outfit font-semibold text-[15px] hover:bg-gray-800 transition duration-200"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>

          {/* STEP 3: Passenger Details & Payment */}
          <div
            ref={step3Ref}
            className={`w-full mt-8 bg-white overflow-hidden scroll-mt-4 transition-[max-height,opacity] duration-500 ease-in-out ${
              isOpen && selectedTaxi
                ? "max-h-[2000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center text-center rounded-[15px] justify-between bg-[#DCDCDC] py-5 px-4 sm:px-6 lg:px-12 w-full">
              <div className="flex items-center lg:mx-20 mx-16 justify-start sm:justify-start gap-3 text-center sm:text-left w-full sm:w-auto">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="appearance-none w-5 h-5 border-2 border-black rounded-full checked:bg-black checked:border-black transition-all duration-300 ease-in-out"
                  />
                  <div className="absolute w-2 h-2 bg-white rounded-full transition-all duration-300 ease-in-out"></div>
                </div>
                <h2 className="text-center lg:text-[20px] text-[16px] font-semibold gradient-text">
                  <span className="font-extrabold text-center font-outfit">
                    STEP 3 :
                  </span>{" "}
                  <span className="font-medium font-outfit">
                    Passenger Details
                  </span>
                </h2>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedTaxi(null);
                  setPaymentError("");
                }}
                className="flex items-center justify-center lg:mx-20 md:mx-20 sm:justify-end text-gray-800 hover:text-blue-600 transition w-full sm:w-auto"
              ></button>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8 lg:px-32">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold font-outfit text-black mb-6 text-center">
                  Booking Confirmation
                </h3>

                {/* Payment Error */}
                {paymentError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium">
                    {paymentError}
                  </div>
                )}

                <form
                  className="flex flex-col gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (selectedTaxi) handleBookNow(selectedTaxi);
                  }}
                >
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-black font-outfit font-medium mb-2 text-[16px]">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        required
                        className="p-3 rounded-xl border-2 border-gray-300 text-black focus:outline-none focus:border-black transition"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-black font-outfit font-medium mb-2 text-[16px]">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        required
                        className="p-3 rounded-xl border-2 border-gray-300 text-black focus:outline-none focus:border-black transition"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-black font-outfit font-medium mb-2 text-[16px]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                      className="p-3 rounded-xl border-2 border-gray-300 text-black focus:outline-none focus:border-black transition"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-black font-outfit font-medium mb-2 text-[16px]">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                      className="p-3 rounded-xl border-2 border-gray-300 text-black focus:outline-none focus:border-black transition"
                    />
                  </div>

                  {/* Price Summary */}
                  {selectedTaxi && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-outfit text-gray-600">
                          Vehicle
                        </span>
                        <span className="font-outfit font-semibold text-black">
                          {selectedTaxi.carType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                        <span className="font-outfit font-bold text-black text-lg">
                          Total
                        </span>
                        <span className="font-outfit font-bold text-[#006F14] text-lg">
                          {formatPrice(selectedTaxi.totalPrice)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="mt-4 py-4 bg-gradient text-white font-semibold font-outfit text-[18px] rounded-2xl hover:bg-gray-800 transition duration-200 w-full"
                  >
                    Proceed to Payment
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxiItems;