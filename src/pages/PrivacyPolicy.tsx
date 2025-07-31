"use client"

import { motion } from "framer-motion"
import { Shield, Eye, Lock, Database, Users, AlertTriangle, Phone, Mail, CheckCircle } from "lucide-react"
import { Link } from "react-router-dom"

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold neon-text mb-4">🔒 Privacy Policy</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your privacy and data security are our top priorities. Learn how we protect and use your information.
          </p>
          <p className="text-sm text-gray-400 mt-2">Last updated: January 2024</p>
        </motion.div>

        <div className="space-y-8">
          {/* Data Collection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Database className="w-6 h-6 text-blue-400" />
              <span>📊 Information We Collect</span>
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">✅ Personal Information</h3>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• 👤 Name and contact information</li>
                  <li>• 📧 Email address and phone number</li>
                  <li>• 📍 Location data (with permission)</li>
                  <li>• 🏥 Health profile information (optional)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">⚠️ Health Data</h3>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• 🤒 Symptoms and health concerns</li>
                  <li>• 💊 Medicine analysis requests</li>
                  <li>• 📈 Health trends and patterns</li>
                  <li>• 🗣️ Voice recordings (processed locally)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-purple-400">🔧 Technical Data</h3>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• 🌐 IP address and browser information</li>
                  <li>• 📱 Device type and operating system</li>
                  <li>• 📊 Usage analytics and performance data</li>
                  <li>• 🍪 Cookies and session data</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* How We Use Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Eye className="w-6 h-6 text-green-400" />
              <span>🎯 How We Use Your Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">🏥 Healthcare Services</h3>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Provide symptom analysis and recommendations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Analyze medicine images and provide information</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Connect you with relevant healthcare providers</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">🔧 Service Improvement</h3>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Improve AI accuracy and performance</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Develop new features and services</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Analyze usage patterns and trends</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Data Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Lock className="w-6 h-6 text-red-400" />
              <span>🛡️ Data Security & Protection</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">🔐 Encryption</h3>
                <p className="text-sm text-gray-400">End-to-end encryption for all sensitive data</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">🛡️ Secure Storage</h3>
                <p className="text-sm text-gray-400">Data stored in secure, compliant servers</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">👥 Access Control</h3>
                <p className="text-sm text-gray-400">Limited access on need-to-know basis</p>
              </div>
            </div>
          </motion.div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Users className="w-6 h-6 text-yellow-400" />
              <span>⚖️ Your Rights & Choices</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">✅ Data Rights</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• 👁️ Access your personal data</li>
                  <li>• ✏️ Correct inaccurate information</li>
                  <li>• 🗑️ Delete your account and data</li>
                  <li>• 📤 Export your data</li>
                  <li>• 🚫 Opt-out of data processing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">🔧 Control Options</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• 📧 Email notification preferences</li>
                  <li>• 🍪 Cookie and tracking settings</li>
                  <li>• 📍 Location sharing controls</li>
                  <li>• 🔒 Privacy level adjustments</li>
                  <li>• 📱 Device permissions management</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Third Party Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-6 rounded-xl shadow-3d"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              <span>🔗 Third-Party Services</span>
            </h2>

            <div className="space-y-4">
              <p className="text-gray-300">We use trusted third-party services to provide our features:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-400/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-400">🤖 AI Services</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Google Gemini AI (symptom analysis)</li>
                    <li>• Google Cloud Vision (image analysis)</li>
                    <li>• Speech recognition services</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-400/10 rounded-lg">
                  <h3 className="font-semibold mb-2 text-green-400">🔧 Infrastructure</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Cloud storage providers</li>
                    <li>• Analytics and monitoring</li>
                    <li>• Email and communication services</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong className="text-yellow-400">⚠️ Note:</strong> These services have their own privacy policies.
                  We ensure they meet our security standards and only share necessary data.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass p-6 rounded-xl shadow-3d border border-blue-400/20"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Phone className="w-6 h-6 text-blue-400" />
              <span>📞 Contact Us About Privacy</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-300 mb-4">If you have questions about this privacy policy or your data:</p>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <a href="mailto:privacy@medicare-nepal.com" className="text-blue-400 hover:text-blue-300">
                      privacy@medicare-nepal.com
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
                <p className="text-gray-300 mb-4">We're committed to transparency and will respond within 48 hours.</p>

                <div className="flex space-x-2">
                  <Link to="/contact" className="flex-1 glow-button py-2 text-center btn-3d-primary">
                    📧 Contact Form
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
