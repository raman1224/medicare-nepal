"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Heart, Shield, Star, Users } from "lucide-react"
import { useTranslation } from "react-i18next"

const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-black/50 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold mb-6 neon-text">{t("footer.whyTrustUs")}</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass p-6 rounded-lg">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t("footer.verified")}</h4>
              <p className="text-sm text-gray-400">{t("footer.verifiedDesc")}</p>
            </div>

            <div className="glass p-6 rounded-lg">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">5,000+</h4>
              <p className="text-sm text-gray-400">{t("footer.trustedUsers")}</p>
            </div>

            <div className="glass p-6 rounded-lg">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">4.9/5</h4>
              <p className="text-sm text-gray-400">{t("footer.rating")}</p>
            </div>

            <div className="glass p-6 rounded-lg">
              <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t("footer.mission")}</h4>
              <p className="text-sm text-gray-400">{t("footer.missionDesc")}</p>
            </div>
          </div>

          <p className="text-lg text-gray-300 max-w-3xl mx-auto">{t("footer.commitment")}</p>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo6.png" alt="Medicare Nepal Logo" className="w-8 h-8 rounded-full" />
              <span className="text-xl font-bold neon-text">Medicare Nepal</span>
            </div>
            <p className="text-gray-400 text-sm">{t("footer.description")}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-blue-400">{t("footer.services")}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/symptom-analyzer" className="hover:text-white transition-colors">
                  {t("footer.symptomAnalysis")}
                </a>
              </li>
              <li>
                <a href="/image-analyzer" className="hover:text-white transition-colors">
                  {t("footer.medicineAnalysis")}
                </a>
              </li>
              <li>
                <a href="/hospitals" className="hover:text-white transition-colors">
                  {t("footer.hospitalFinder")}
                </a>
              </li>
              <li>
                <a href="/disease-info" className="hover:text-white transition-colors">
                  {t("Disease Info")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.emergencyServices")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-blue-400">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.helpCenter")}
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors">
                  {t("footer.contactUs")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.terms")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-blue-400">{t("footer.emergency")}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="tel:102" className="hover:text-white transition-colors">
                  🚑 102 - {t("footer.ambulance")}
                </a>
              </li>
              <li>
                <a href="tel:100" className="hover:text-white transition-colors">
                  🚓 100 - {t("footer.police")}
                </a>
              </li>
              <li>
                <a href="tel:101" className="hover:text-white transition-colors">
                  🔥 101 - {t("footer.fire")}
                </a>
              </li>
              <li>
                <a href="tel:1166" className="hover:text-white transition-colors">
                  🏥 1166 - {t("footer.healthHotline")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/g5.png" alt="Nepal Flag" className="w-6 h-6 rounded-full" />
            <p className="text-sm text-gray-400">
              {t("footer.poweredBy")}{" "}
              <a
                href="https://raman1224.github.io/DANGOL_AI/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                DANGOL AI
              </a>
            </p>
          </div>

          <p className="text-sm text-gray-400">© 2024 DANGOL AI. {t("footer.allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
