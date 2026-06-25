"use client";

import React from "react";

const ContactInfoBar = () => {
  return (
    <div className="bg-[#DCDCDC]  py-5 px-6 flex flex-col  sm:flex-row justify-between items-center text-center sm:text-left text-black w-[100%]   ">
      <p className="font-semibold text-sm sm:text-base text-black">
        Phone:{" "}
        <a
          href="tel:+919027412161"
          className="underline font-bold hover:text-gray-700"
        >
          +91 90274 12161
        </a>
        {" | "}
        <a
          href="tel:+917456049063"
          className="underline font-bold hover:text-gray-700"
        >
          +91 74560 49063
        </a>
      </p>

      <p className="font-semibold text-sm sm:text-base mt-2 sm:mt-0 text-black">
        Mail:{" "}
        <a
          href="mailto:chandgautam64@gmail.com"
          className="underline font-bold hover:text-gray-700"
        >
         chandgautam64@gmail.com
        </a>
      </p>
    </div>
  );
};

export default ContactInfoBar;
