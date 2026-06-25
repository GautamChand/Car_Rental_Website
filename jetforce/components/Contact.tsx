import Link from "next/link";
import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");
    if (!form.name || !form.email || !form.phone || !form.message) {
      setError("All fields are required.");
      setStatus("");
      return;
    }

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Message sent successfully!");
        setForm({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => {
          setStatus("");
        }, 2000);
      } else {
        setStatus("❌ Failed: " + data.error);
        setTimeout(() => {
          setStatus("");
        }, 2000);
      }
    } catch (error: any) {
      setStatus("❌ Error: " + error.message);
    }
  };

  return (
    <div
      className="bg-white mx-auto lg:scroll-mt-[7rem] p-2 lg:p-0 sm:scroll-mt-[9rem] scroll-mt-[9rem] my-8 flex flex-col items-center"
      id="contact" 
    >
      {/* Fullscreen Header */}
      <div className="w-full h-20 rounded-[15px] bg-gradient flex items-center justify-center  lg:mb-8">
        <h2 className=" text-[24px]  text-white font-outfit font-bold uppercase text-center underline">
          Experience luxury travel with us!
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center gap-12 w-full">
        {/* Form */}
        <form 
          className="w-full max-w-full sm:w-[768px] flex flex-col items-center gap-4 px-4 mt-10 lg:mt-20"
          onSubmit={handleQuery}
        >
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-4 rounded-2xl border border-gray-300 text-[20px] font-outfit font-medium placeholder:text-[#A5A3A3] focus:outline-none focus:ring-2 bg-[#D9D9D9] text-[#000000]"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-2xl border border-gray-300 text-[20px] font-outfit font-medium placeholder:text-[#A5A3A3] focus:outline-none focus:ring-2 bg-[#D9D9D9] text-[#000000]"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-4 rounded-2xl border border-gray-300  text-[20px] font-outfit font-medium placeholder:text-[#A5A3A3] focus:outline-none focus:ring-2 bg-[#D9D9D9] text-[#000000]"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <textarea
            placeholder="Message"
            rows={4}
            className="w-full p-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 text-[20px] font-outfit font-medium placeholder:text-[#A5A3A3] bg-[#D9D9D9] text-[#000000]"
            name="message"
            value={form.message}
            onChange={handleChange}
          />
          {error && <p className="text-red-500 font-semibold">{error}</p>}
          <button
            type="submit"
            className="bg-gradient text-white font-medium font-outfit text-[26px] rounded-[67px] mt-6 py-4 px-10 w-full sm:w-auto text-center "
          >
            SEND MESSAGE
          </button>
          {status && (
            <p className="mt-2 text-green-600 font-semibold">{status}</p>
          )}
        </form>

        {/* Contact Information */}
        <div className="w-full max-w-full sm:w-[768px] flex flex-col items-center text-center gap-2 px-4">
          <h2 className="font-bold lg:text-[36px] text-[24px] underline text-black">CONTACT US!</h2>

          <button
            onClick={() => {
              const phoneNumber = "919027412161";
              const message = encodeURIComponent("Hello! I want to chat about booking a ride with DriveElite.");
              const url = `https://wa.me/${phoneNumber}?text=${message}`;
              window.open(url, "_blank");
            }}
            className="flex items-center gap-2 mt-3 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full mb-2 font-semibold transition duration-200"
          >
            <FaWhatsapp className="text-white text-xl" />Message Us Instantly
          </button>

          <div className="flex flex-col items-center gap-1">
            <h3 className="font-bold  lg:text-[24px] text-[20px] text-gradient-underline text-gradient">Mail:</h3>
            <Link
              href="mailto:chandgautam64@gmail.com"
              className="text-[#000000] hover:underline break-words  lg:text-[24px] text-[18px]"
            >
              chandgautam64@gmail.com
            </Link>
            <Link
              href="mailto:himanshu2006f@gmail.com"
              className="text-[#000000] hover:underline break-words  lg:text-[24px] text-[18px]"
            >
              himanshu2006f@gmail.com
            </Link>
          </div>

          <div className="flex flex-col items-center gap-1 mt-2">
            <h3 className="font-bold  lg:text-[24px] text-[20px] text-gradient-underline text-gradient">Phone Number:</h3>
            <Link
              href="tel:+919027412161"
              className="text-[#000000] hover:underline break-words  lg:text-[24px] text-[18px]"
            >
              +91 90274 12161
            </Link>
            <Link
              href="tel:+917456049063"
              className="text-[#000000] hover:underline break-words  lg:text-[24px] text-[18px]"
            >
              +91 74560 49063
            </Link>
          </div>

          <div className="flex flex-col items-center gap-1 mt-2">
            <h3 className="font-bold  lg:text-[24px] text-[20px] text-gradient-underline text-gradient">City:</h3>
            <span className=" lg:text-[24px] text-[18px] text-[#000000] hover:underline break-words">
             Dehradun, Uttarakhand
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;