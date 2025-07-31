"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import { contactAPI } from "../services/api"

const ContactUs = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await contactAPI.submit(formData)

      if (response.data.success) {
        toast.success("✅ Message sent successfully! We will get back to you soon.")
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          category: "general",
        })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold neon-text mb-4">📞 Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get in touch with our team. We're here to help with your health questions and technical support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-blue-400" />
              <span>💬 Send us a Message</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">👤 Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="glow-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">📧 Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="glow-input w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">📱 Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+977 98XXXXXXXX"
                    className="glow-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">📂 Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="glow-input w-full bg-gray-800"
                  >
                    <option value="general">🔍 General Inquiry</option>
                    <option value="technical">🔧 Technical Support</option>
                    <option value="medical">🏥 Medical Question</option>
                    <option value="feedback">💭 Feedback</option>
                    <option value="complaint">⚠️ Complaint</option>
                    <option value="suggestion">💡 Suggestion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">📝 Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your inquiry"
                  className="glow-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">💬 Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please describe your question or concern in detail..."
                  rows={6}
                  className="glow-input w-full resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="glow-button w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 btn-3d-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="loading-dots">Sending message</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>🚀 Send Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Contact Details */}
            <div className="glass p-6 rounded-xl shadow-3d">
              <h3 className="text-xl font-bold mb-4 text-blue-400">📍 Get in Touch</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-medium">📞 Support Phone</p>
                    <a href="tel:9763774451" className="text-green-400 hover:text-green-300">
                      +977 9763774451
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-medium">📧 Email Support</p>
                    <a href="mailto:support@medicare-nepal.com" className="text-blue-400 hover:text-blue-300">
                      support@medicare-nepal.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="font-medium">🏢 Office Location</p>
                    <p className="text-gray-400">Kathmandu, Nepal</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-medium">⏰ Support Hours</p>
                    <p className="text-gray-400">24/7 Online Support</p>
                    <p className="text-gray-400">Phone: 9 AM - 6 PM (NPT)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="glass p-6 rounded-xl shadow-3d">
              <h3 className="text-xl font-bold mb-4 text-purple-400">❓ Frequently Asked Questions</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">🤔 How accurate is the symptom analysis?</h4>
                  <p className="text-sm text-gray-400">
                    Our AI provides 85-95% accuracy, but always consult a doctor for serious symptoms.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">💊 Can I trust the medicine recommendations?</h4>
                  <p className="text-sm text-gray-400">
                    All recommendations are reviewed by medical professionals and based on standard guidelines.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">🔒 Is my health data secure?</h4>
                  <p className="text-sm text-gray-400">
                    Yes, we use end-to-end encryption and follow strict privacy policies.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">🆓 Is the service free?</h4>
                  <p className="text-sm text-gray-400">
                    Basic features are free. Premium features available for advanced analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="glass p-6 rounded-xl border border-red-400/20 shadow-3d">
              <h3 className="text-xl font-bold mb-4 text-red-400">🚨 Medical Emergency?</h3>

              <p className="text-gray-300 mb-4">
                If you're experiencing a medical emergency, don't wait for our response. Contact emergency services
                immediately.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <a
                  href="tel:102"
                  className="flex items-center justify-center space-x-2 p-3 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors btn-3d-danger"
                >
                  <Phone className="w-4 h-4" />
                  <span>🚑 102</span>
                </a>

                <a
                  href="tel:1166"
                  className="flex items-center justify-center space-x-2 p-3 bg-blue-400/10 rounded-lg hover:bg-blue-400/20 transition-colors btn-3d-primary"
                >
                  <Phone className="w-4 h-4" />
                  <span>🏥 1166</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ContactUs
