"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="w-full bg-gray-50 py-24 sm:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Get in <span className="text-orange-600">Touch</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto"
          >
            Have questions about our plans or want to customize your menu? We are here to help you.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* CONTACT INFO */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 space-y-8"
          >
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 group hover:border-orange-200 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Call Us</h4>
              <p className="text-gray-500">+91 98765 43210</p>
              <p className="text-gray-500">+91 91234 56789</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 group hover:border-orange-200 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Email Us</h4>
              <p className="text-gray-500">hello@annapurna.com</p>
              <p className="text-gray-500">support@annapurna.com</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 group hover:border-orange-200 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h4>
              <p className="text-gray-500">123 Food Street, Sector 45</p>
              <p className="text-gray-500">Indore, MP, India</p>
            </div>
          </motion.div>

          {/* FORM */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-gray-200 border border-gray-100"
          >
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all">
                  <option>General Inquiry</option>
                  <option>Plan Subscription</option>
                  <option>Custom Menu Request</option>
                  <option>Corporate Tie-up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us how we can help you..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-12 py-5 bg-orange-600 text-white font-black text-lg rounded-[2rem] shadow-xl shadow-orange-200 hover:bg-orange-700 hover:shadow-orange-300 transition-all flex items-center justify-center gap-3 group active:scale-95"
              >
                Send Message
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
