import React, { useState } from 'react';
import Navbar from './Navbar';
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import { toast, Toaster } from "react-hot-toast";
import { Instagram, PhoneCall } from 'lucide-react';

const Contact = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    emailjs.sendForm('service_iin80pi', 'template_9cgyx89', e.target, 'RDTXEzfI_dfMrgOJI')
      .then(() => {
        toast.success('Message sent successfully!');
        e.target.reset();
      })
      .catch(() => toast.error('Failed to send message, please try again.'))
      .finally(() => setSending(false));
  };

  return (
    <>
    <Navbar />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="max-w-xl mx-auto px-6 py-20">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold text-emerald-600 mb-4">📞 Get in Touch</h1>
        <p className="text-center text-gray-500 mb-8">Have a question or feedback? Drop us a message, and we will respond promptly.</p>
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur p-8 rounded-3xl shadow-2xl space-y-5 border border-gray-200 animate-fadeIn">
          <input name="from_name" type="text" placeholder="Your Name" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm" />
          <input name="reply_to" type="email" placeholder="Your Email" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm" />
          <textarea name="message" placeholder="Your Message" rows="5" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm resize-none"></textarea>
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={sending} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-transform shadow hover:shadow-lg">
            {sending ? 'Sending...' : 'Send Message'}
          </motion.button>
        </form>

        <div className="flex justify-center gap-6 mt-8 animate-fadeIn">
          <a href="https://instagram.com/YOUR_INSTAGRAM" target="_blank" rel="noopener noreferrer" className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110">
            <Instagram size={24} />
          </a>
          <a href="https://wa.me/YOUR_WHATSAPP_NUMBER" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110">
            <PhoneCall size={24} />
          </a>
        </div>
      </motion.div>
    </>
  );
};

export default Contact;
