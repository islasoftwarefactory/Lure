import BackgroundImage from "./ui/background-image"
import WaitlistForm from "./ui/waitlist-form"
import PasswordModal from "./ui/password-modal"
import Timeline from "./ui/timeline"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center font-recoleta">
      <BackgroundImage
        desktop={{
          src: "/images/background.jpg",
          alt: "Shipping scene with delivery truck and boxes",
          position: "center",
          scaling: "cover",
          overlay: "rgba(0,0,0,0.4)", // Adding overlay for better text visibility
        }}
        mobile={{
          src: "/images/background.jpg",
          alt: "Shipping scene with delivery truck and boxes",
          position: "75% center",
          scaling: "cover",
          overlay: "rgba(0,0,0,0.5)", // Darker overlay for mobile
        }}
      />

      {/* Single encompassing block for all content with improved spacing */}
      <div className="relative z-10 backdrop-blur-md bg-black/30 rounded-xl p-10 shadow-lg border border-white/10 max-w-3xl mx-4 md:mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-recoleta">New Collection Coming Soon</h1>
          <p className="text-xl text-white mb-12 font-recoleta">
            Be the first to know when our new clothing line launches.
          </p>

          {/* Buttons Container with improved spacing */}
          <div className="flex flex-col items-center gap-6 mb-16">
            {/* Primary Waitlist Button - Full width */}
            <WaitlistForm className="w-full max-w-md" />

            {/* Secondary Password Button - Text link style */}
            <PasswordModal className="text-link" />
          </div>

          {/* Timeline with more spacing above */}
          <Timeline />
        </div>
      </div>
    </main>
  )
}
