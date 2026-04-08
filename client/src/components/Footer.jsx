import React from "react";
import { BsRobot } from "react-icons/bs";

function Footer() {
  return (
    <div className="bg-white border-t border-gray-200 mt-10">
      <div className="max-w-6xl mx-auto px-6 py-14">

        
        <div className="grid md:grid-cols-3 gap-10">

          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-blue-500 text-white p-2 rounded-lg">
                <BsRobot size={18} />
              </div>
              <h2 className="font-bold text-lg">Intervexa AI</h2>
            </div>

            <p className="text-gray-600 text-sm leading-7">
              Intervexa AI is an AI-powered interview preparation platform
              designed to improve communication skills, technical knowledge,
              and confidence through real-time mock interviews and analytics.
            </p>
          </div>

        
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>

            <ul className="space-y-3 text-sm text-gray-600">
              <li className="hover:text-black cursor-pointer">Home</li>
              <li className="hover:text-black cursor-pointer">About Us</li>
              <li className="hover:text-black cursor-pointer">Contact Us</li>
              <li className="hover:text-black cursor-pointer">Privacy Policy</li>
            </ul>
          </div>

          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Subscribe to our newsletter
            </h3>

            <p className="text-gray-600 text-sm mb-4">
              The latest updates, interview tips, and resources delivered weekly.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />

              <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition">
                Subscribe
              </button>
            </div>
          </div>

        </div>

       
        <div className="border-t border-gray-200 mt-10 pt-6 text-center text-sm text-gray-500">
          © 2026 Intervexa AI. All Rights Reserved.
        </div>

      </div>
    </div>
  );
}

export default Footer;

