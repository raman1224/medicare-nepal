"use client"

import type React from "react"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Activity, Camera, MapPin, Users, Shield, Star, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import AOS from "aos"

const Home: React.FC = () => {
  const { t } = useTranslation()

  useEffect(() => {
    AOS.refresh()
  }, [])

  const features = [
    {
      icon: Activity,
      title: t("home.features.symptom.title"),
      description: t("home.features.symptom.description"),
      link: "/symptom-analyzer",
      color: "text-red-400",
      bgColor: "bg-red-400/10",
    },
    {
      icon: Camera,
      title: t("home.features.medicine.title"),
      description: t("home.features.medicine.description"),
      link: "/image-analyzer",
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      icon: MapPin,
      title: t("home.features.hospital.title"),
      description: t("home.features.hospital.description"),
      link: "/hospitals",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
  ]

  const stats = [
    { number: "50,000+", label: "Trusted Users", icon: Users },
    { number: "99.9%", label: "Accuracy Rate", icon: Shield },
    { number: "4.9/5", label: "User Rating", icon: Star },
  ]

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center space-x-2 mb-6">
                <img src="/g5.png" alt="Nepal Flag" className="w-16 h-16 rounded-full animate-pulse-glow" />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold neon-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t("home.hero.title")}
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">{t("home.hero.subtitle")}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/symptom-analyzer" className="glow-button text-lg px-8 py-4 flex items-center space-x-2">
                  <span>{t("home.hero.cta")}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <div className="flex items-center space-x-2 text-gray-400">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>{t("home.hero.features")}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-float delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-float delay-2000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center glass p-6 rounded-lg"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <stat.icon className="w-8 h-8 mx-auto mb-4 text-blue-400" />
                <div className="text-3xl font-bold neon-text mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 neon-text">Our Services</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive health solutions powered by advanced technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <Link
                  to={feature.link}
                  className="block glass p-8 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  <div
                    className={`w-16 h-16 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6 group-hover:animate-pulse`}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>

                  <h3 className="text-xl font-semibold mb-4 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 mb-6">{feature.description}</p>

                  <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                    <span className="mr-2">Learn More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold neon-text">Ready to Take Control of Your Health?</h2>

            <p className="text-xl text-gray-300">
              Join thousands of Nepali users who trust our platform for their health needs
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="glow-button text-lg px-8 py-4">
                Get Started Free
              </Link>

              <Link
                to="/hospitals"
                className="px-8 py-4 border-2 border-gray-600 rounded-lg text-gray-300 hover:border-gray-400 hover:text-white transition-all duration-300"
              >
                Find Hospitals
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
