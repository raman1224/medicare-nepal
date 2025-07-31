"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Navigation,
  Filter,
  Search,
  Heart,
  Stethoscope,
  Brain,
  Eye,
  Baby,
} from "lucide-react"
import { useTranslation } from "react-i18next"

interface Hospital {
  id: string
  name: string
  province: string
  district: string
  phone: string
  website?: string
  departments: string[]
  rating: number
  description: string
  address: string
  emergencyNumber: string
  coordinates: {
    lat: number
    lng: number
  }
}

const Hospitals: React.FC = () => {
  useTranslation()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [selectedProvince, setSelectedProvince] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const provinces = ["Koshi", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim", "Madhesh"]

  const departments = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Gynecology",
    "Emergency",
    "ICU",
    "Surgery",
    "Dermatology",
    "Ophthalmology",
  ]

  const emergencyNumbers = [
    { district: "Kathmandu", ambulance: "102", hospital: "01-4412404" },
    { district: "Pokhara", ambulance: "102", hospital: "061-465200" },
    { district: "Jhapa", ambulance: "102", hospital: "023-582000" },
    { district: "Chitwan", ambulance: "102", hospital: "056-527281" },
    { district: "Butwal", ambulance: "102", hospital: "071-547722" },
    { district: "Dharan", ambulance: "102", hospital: "025-520133" },
  ]

  useEffect(() => {
    // Mock hospital data
    const mockHospitals: Hospital[] = [
      {
        id: "1",
        name: "Tribhuvan University Teaching Hospital",
        province: "Bagmati",
        district: "Kathmandu",
        phone: "01-4412404",
        website: "https://tuth.edu.np",
        departments: ["Cardiology", "Neurology", "Emergency", "ICU", "Surgery"],
        rating: 4.8,
        description:
          "Leading medical institution in Nepal providing comprehensive healthcare services with state-of-the-art facilities and experienced medical professionals.",
        address: "Maharajgunj, Kathmandu",
        emergencyNumber: "01-4412404",
        coordinates: { lat: 27.7172, lng: 85.324 },
      },
      {
        id: "2",
        name: "Bir Hospital",
        province: "Bagmati",
        district: "Kathmandu",
        phone: "01-4221119",
        departments: ["Emergency", "Surgery", "Orthopedics", "Pediatrics"],
        rating: 4.5,
        description:
          "One of the oldest and most trusted hospitals in Nepal, providing quality healthcare services to patients from all walks of life.",
        address: "Mahaboudha, Kathmandu",
        emergencyNumber: "01-4221119",
        coordinates: { lat: 27.7024, lng: 85.3077 },
      },
      {
        id: "3",
        name: "Manipal Teaching Hospital",
        province: "Bagmati",
        district: "Kavre",
        phone: "011-490497",
        website: "https://manipalhospitals.com",
        departments: ["Cardiology", "Neurology", "Orthopedics", "Gynecology", "ICU"],
        rating: 4.7,
        description:
          "Modern healthcare facility with advanced medical technology and highly qualified medical professionals providing world-class treatment.",
        address: "Phulbari, Pokhara",
        emergencyNumber: "011-490497",
        coordinates: { lat: 27.6244, lng: 85.5381 },
      },
      {
        id: "4",
        name: "Western Regional Hospital",
        province: "Gandaki",
        district: "Pokhara",
        phone: "061-465200",
        departments: ["Emergency", "Surgery", "Pediatrics", "Dermatology"],
        rating: 4.3,
        description:
          "Regional hospital serving the western region with comprehensive medical services and emergency care facilities.",
        address: "Pokhara-6, Kaski",
        emergencyNumber: "061-465200",
        coordinates: { lat: 28.2096, lng: 83.9856 },
      },
      {
        id: "5",
        name: "Mechi Zonal Hospital",
        province: "Koshi",
        district: "Jhapa",
        phone: "023-582000",
        departments: ["Emergency", "Surgery", "Orthopedics", "Ophthalmology"],
        rating: 4.2,
        description:
          "Zonal hospital providing quality healthcare services to the eastern region with modern facilities and experienced staff.",
        address: "Bhadrapur, Jhapa",
        emergencyNumber: "023-582000",
        coordinates: { lat: 26.5448, lng: 88.0695 },
      },
      {
        id: "6",
        name: "Bharatpur Hospital",
        province: "Bagmati",
        district: "Chitwan",
        phone: "056-527281",
        departments: ["Cardiology", "Emergency", "ICU", "Pediatrics", "Gynecology"],
        rating: 4.4,
        description:
          "Multi-specialty hospital in Chitwan providing comprehensive healthcare services with modern medical equipment.",
        address: "Bharatpur-10, Chitwan",
        emergencyNumber: "056-527281",
        coordinates: { lat: 27.6767, lng: 84.4298 },
      },
    ]

    setHospitals(mockHospitals)
    setFilteredHospitals(mockHospitals)
  }, [])

  useEffect(() => {
    let filtered = hospitals

    if (selectedProvince !== "all") {
      filtered = filtered.filter((hospital) => hospital.province === selectedProvince)
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter((hospital) => hospital.departments.includes(selectedDepartment))
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (hospital) =>
          hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hospital.district.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredHospitals(filtered)
  }, [hospitals, selectedProvince, selectedDepartment, searchQuery])

  const getDepartmentIcon = (department: string) => {
    switch (department.toLowerCase()) {
      case "cardiology":
        return Heart
      case "neurology":
        return Brain
      case "pediatrics":
        return Baby
      case "ophthalmology":
        return Eye
      default:
        return Stethoscope
    }
  }

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, "_self")
  }

  const handleDirections = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MapPin className="w-8 h-8 text-blue-400 animate-pulse" />
            <h1 className="text-3xl font-bold neon-text">Top Hospitals in Nepal</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Find the best hospitals and healthcare facilities across Nepal. Get contact information, departments, and
            directions to quality medical care.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-xl mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glow-input w-full pl-10"
              />
            </div>

            {/* Province Filter */}
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="glow-input w-full"
            >
              <option value="all">All Provinces</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="glow-input w-full"
            >
              <option value="all">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center glass rounded-lg px-4 py-2">
              <Filter className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-gray-300">{filteredHospitals.length} hospitals found</span>
            </div>
          </div>
        </motion.div>

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {filteredHospitals.map((hospital, index) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass p-6 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              {/* Hospital Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{hospital.name}</h3>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{hospital.address}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(hospital.rating) ? "text-yellow-400 fill-current" : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-400 ml-2">{hospital.rating}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-400">{hospital.province}</div>
                  <div className="text-sm font-medium">{hospital.district}</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{hospital.description}</p>

              {/* Departments */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-blue-400">Departments</h4>
                <div className="flex flex-wrap gap-2">
                  {hospital.departments.slice(0, 4).map((department, idx) => {
                    const IconComponent = getDepartmentIcon(department)
                    return (
                      <div
                        key={idx}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-400/10 rounded-full text-xs"
                      >
                        <IconComponent className="w-3 h-3 text-blue-400" />
                        <span>{department}</span>
                      </div>
                    )
                  })}
                  {hospital.departments.length > 4 && (
                    <div className="px-2 py-1 bg-gray-600/20 rounded-full text-xs text-gray-400">
                      +{hospital.departments.length - 4} more
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCall(hospital.phone)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-400/10 border border-green-400/20 rounded-lg hover:bg-green-400/20 transition-colors text-green-400"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Call</span>
                </button>

                <button
                  onClick={() => handleDirections(hospital)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-400/10 border border-blue-400/20 rounded-lg hover:bg-blue-400/20 transition-colors text-blue-400"
                >
                  <Navigation className="w-4 h-4" />
                  <span className="text-sm">Directions</span>
                </button>

                {hospital.website && (
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-400/10 border border-purple-400/20 rounded-lg hover:bg-purple-400/20 transition-colors text-purple-400"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Website</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Emergency Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-6 rounded-xl"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center space-x-2 text-red-400">
            <Phone className="w-6 h-6" />
            <span>Emergency Contact Numbers</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {emergencyNumbers.map((emergency, index) => (
              <div key={index} className="glass p-4 rounded-lg">
                <h4 className="font-semibold mb-3">{emergency.district}</h4>
                <div className="space-y-2">
                  <a
                    href={`tel:${emergency.ambulance}`}
                    className="flex items-center space-x-2 p-2 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-400/20 rounded-lg flex items-center justify-center">
                      <span className="text-red-400 text-sm">🚑</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Ambulance</p>
                      <p className="text-red-400 font-bold">{emergency.ambulance}</p>
                    </div>
                  </a>

                  <a
                    href={`tel:${emergency.hospital}`}
                    className="flex items-center space-x-2 p-2 bg-blue-400/10 rounded-lg hover:bg-blue-400/20 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-sm">🏥</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hospital</p>
                      <p className="text-blue-400 font-bold">{emergency.hospital}</p>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* National Emergency Numbers */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="font-semibold mb-4 text-yellow-400">National Emergency Numbers</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="tel:102"
                className="flex flex-col items-center p-4 glass rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 bg-red-400/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🚑</span>
                </div>
                <p className="text-sm font-medium">Ambulance</p>
                <p className="text-red-400 font-bold">102</p>
              </a>

              <a
                href="tel:100"
                className="flex flex-col items-center p-4 glass rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-400/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🚓</span>
                </div>
                <p className="text-sm font-medium">Police</p>
                <p className="text-blue-400 font-bold">100</p>
              </a>

              <a
                href="tel:101"
                className="flex flex-col items-center p-4 glass rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 bg-orange-400/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🔥</span>
                </div>
                <p className="text-sm font-medium">Fire Service</p>
                <p className="text-orange-400 font-bold">101</p>
              </a>

              <a
                href="tel:1166"
                className="flex flex-col items-center p-4 glass rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🏥</span>
                </div>
                <p className="text-sm font-medium">Health Hotline</p>
                <p className="text-green-400 font-bold">1166</p>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Hospitals
