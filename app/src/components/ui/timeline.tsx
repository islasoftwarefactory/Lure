import { CalendarDays, Clock, Users } from "lucide-react"

export default function Timeline() {
  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-white mb-6 text-center font-recoleta">Registration Timeline</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* First timeline item */}
        <div className="bg-white/20 rounded-lg p-6 relative shadow-md border border-white/10">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white rounded-full p-2 shadow-md">
            <CalendarDays size={20} />
          </div>
          <div className="mt-4 text-center">
            <h4 className="font-bold text-white font-recoleta text-lg">Register by 06/20</h4>
            <p className="text-white/90 text-sm mt-3 font-recoleta">Access 10 days before official drop</p>
          </div>
        </div>

        {/* Second timeline item */}
        <div className="bg-white/20 rounded-lg p-6 relative shadow-md border border-white/10">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white rounded-full p-2 shadow-md">
            <Clock size={20} />
          </div>
          <div className="mt-4 text-center">
            <h4 className="font-bold text-white font-recoleta text-lg">Register by 06/30</h4>
            <p className="text-white/90 text-sm mt-3 font-recoleta">Access 5 days before official drop</p>
          </div>
        </div>

        {/* Third timeline item */}
        <div className="bg-white/20 rounded-lg p-6 relative shadow-md border border-white/10">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-500 text-white rounded-full p-2 shadow-md">
            <Users size={20} />
          </div>
          <div className="mt-4 text-center">
            <h4 className="font-bold text-white font-recoleta text-lg">Everyone else</h4>
            <p className="text-white/90 text-sm mt-3 font-recoleta">Access on official drop date (07/10)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
