"use client"

import { motion } from "framer-motion"
import { FileText, AlertTriangle, Shield, Users, Gavel, Heart, Phone, Mail } from "lucide-react"
import { Link } from "react-router-dom"

const TermsOfService = () => {
  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold neon-text mb-4">📋 Terms of Service</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Please read these terms carefully before using Medicare Nepal services.
          </p>
          <p className="text-sm text-gray-400 mt-2">Last updated: January 2024</p>
        </motion.div>

        <div className="space-y-8">
          {/* Service Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-400" />
              <span>🏥 Our Services</span>
            </h2>

            <div className="space-y-4">
              <p className="text-gray-300">
                Medicare Nepal provides AI-powered health analysis and information services including:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-400/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-400">🤒 Symptom Analysis</h3>
                  <p className="text-sm text-gray-300">AI-powered symptom evaluation and health recommendations</p>
                </div>

                <div className="p-4 bg-green-400/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-green-400">💊 Medicine Scanner</h3>
                  <p className="text-sm text-gray-300">Image-based medicine identification and information</p>
                </div>

                <div className="p-4 bg-purple-400/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-purple-400">🏥 Hospital Finder</h3>
                  <p className="text-sm text-gray-300">Comprehensive hospital directory and emergency contacts</p>
                </div>

                <div className="p-4 bg-yellow-400/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-yellow-400">📊 Health Analytics</h3>
                  <p className="text-sm text-gray-300">Personal health tracking and trend analysis</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Medical Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-xl shadow-3d border border-red-400/20"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span>⚠️ Important Medical Disclaimer</span>
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-400">🚨 Not a Substitute for Professional Medical Care</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Our AI provides informational guidance only, not medical diagnosis</li>
                  <li>• Always consult qualified healthcare professionals for medical decisions</li>
                  <li>• In emergencies, contact emergency services immediately (102, 1166)</li>
                  <li>• Do not delay seeking medical care based on our recommendations</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <h3 className="font-semibold mb-2 text-yellow-400">⚖️ Accuracy Limitations</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• AI analysis has inherent limitations and may not be 100% accurate</li>
                  <li>• Results depend on the quality and completeness of input information</li>
                  <li>• Individual health conditions may vary significantly</li>
                  <li>• We continuously improve but cannot guarantee perfect accuracy</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* User Responsibilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-400" />
              <span>👤 User Responsibilities</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">✅ You Must</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Provide accurate and truthful information</li>
                  <li>• Use services responsibly and legally</li>
                  <li>• Respect intellectual property rights</li>
                  <li>• Keep your account credentials secure</li>
                  <li>• Report any security vulnerabilities</li>
                  <li>• Follow community guidelines</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-400">❌ You Must Not</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Share false or misleading health information</li>
                  <li>• Attempt to hack or compromise our systems</li>
                  <li>• Use services for illegal activities</li>
                  <li>• Share your account with others</li>
                  <li>• Spam or abuse our communication channels</li>
                  <li>• Reverse engineer our AI algorithms</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Service Limitations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-yellow-400" />
              <span>⚡ Service Limitations & Availability</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-400/10 rounded-lg text-center">
                  <h3 className="font-semibold mb-2 text-blue-400">🔄 API Limits</h3>
                  <p className="text-sm text-gray-300">Rate limits apply to prevent abuse</p>
                </div>

                <div className="p-4 bg-green-400/10 rounded-lg text-center">
                  <h3 className="font-semibold mb-2 text-green-400">⏰ Availability</h3>
                  <p className="text-sm text-gray-300">99.9% uptime target, maintenance windows</p>
                </div>

                <div className="p-4 bg-purple-400/10 rounded-lg text-center">
                  <h3 className="font-semibold mb-2 text-purple-400">🌍 Geographic</h3>
                  <p className="text-sm text-gray-300">Optimized for Nepal, available globally</p>
                </div>
              </div>

              <div className="p-4 bg-gray-400/10 rounded-lg">
                <h3 className="font-semibold mb-2">📋 Service Modifications</h3>
                <p className="text-gray-300">
                  We reserve the right to modify, suspend, or discontinue services with reasonable notice. We'll notify
                  users of significant changes via email or platform notifications.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Privacy & Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-6 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-green-400" />
              <span>🔒 Privacy & Data Protection</span>
            </h2>

            <div className="space-y-4">
              <p className="text-gray-300">
                Your privacy is paramount. Our data practices are governed by our Privacy Policy:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-400/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-green-400">🛡️ Data Security</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• End-to-end encryption</li>
                    <li>• Secure data storage</li>
                    <li>• Regular security audits</li>
                    <li>• GDPR compliance</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-400/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-400">👤 User Control</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Data access rights</li>
                    <li>• Deletion requests</li>
                    <li>• Export capabilities</li>
                    <li>• Consent management</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <Link to="/privacy" className="glow-button px-6 py-3 btn-3d-primary">
                  📖 Read Full Privacy Policy
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Liability & Warranties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass p-6 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Gavel className="w-6 h-6 text-purple-400" />
              <span>⚖️ Liability & Warranties</span>
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <h3 className="font-semibold mb-2 text-yellow-400">⚠️ Service "As Is"</h3>
                <p className="text-gray-300">
                  Services are provided "as is" without warranties. We strive for accuracy but cannot guarantee
                  error-free operation or results.
                </p>
              </div>

              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-400">🚫 Limitation of Liability</h3>
                <p className="text-gray-300">
                  We are not liable for medical decisions made based on our services. Users assume full responsibility
                  for their health decisions and medical care.
                </p>
              </div>

              <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-400">🤝 Good Faith Effort</h3>
                <p className="text-gray-300">
                  We make every effort to provide accurate, helpful information and maintain service quality. We're
                  committed to continuous improvement and user safety.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact & Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass p-6 rounded-xl shadow-3d border border-blue-400/20"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Phone className="w-6 h-6 text-blue-400" />
              <span>📞 Questions & Updates</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-green-400">📧 Contact Us</h3>
                <p className="text-gray-300 mb-4">Questions about these terms? We're here to help:</p>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <a href="mailto:legal@medicare-nepal.com" className="text-blue-400 hover:text-blue-300">
                      legal@medicare-nepal.com
                    </a>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-green-400" />
                    <a href="tel:9763774451" className="text-green-400 hover:text-green-300">
                      +977 9763774451
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-purple-400">🔄 Terms Updates</h3>
                <p className="text-gray-300 mb-4">
                  We may update these terms. Significant changes will be communicated via:
                </p>

                <ul className="text-gray-300 space-y-1">
                  <li>• 📧 Email notifications</li>
                  <li>• 🔔 In-app announcements</li>
                  <li>• 🌐 Website notices</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-gray-400 mb-4">
                By using Medicare Nepal, you agree to these terms and our commitment to your health and privacy.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/contact" className="glow-button px-6 py-3 btn-3d-primary">
                  📧 Contact Support
                </Link>

                <Link
                  to="/privacy"
                  className="px-6 py-3 border-2 border-gray-600 rounded-lg text-gray-300 hover:border-gray-400 hover:text-white transition-all duration-300 btn-3d-success"
                >
                  🔒 Privacy Policy
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService
