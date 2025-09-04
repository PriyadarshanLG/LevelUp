import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-zara-white">
      {/* Navigation Header - Zara Style */}
      <header className="border-b border-zara-lightsilver bg-zara-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-serif font-normal text-zara-black tracking-wide">
                LEARNHUB
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/login"
                className="text-sm font-light text-zara-charcoal hover:text-zara-black transition-colors duration-200 tracking-zara uppercase"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-light text-zara-charcoal hover:text-zara-black transition-colors duration-200 tracking-zara uppercase border-b border-zara-black pb-0.5"
              >
                Register
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Minimalist Zara Approach */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-7xl font-light text-zara-black mb-8 tracking-wide">
            ELEVATE YOUR
            <br />
            <em className="font-serif">Learning</em>
          </h1>
          <p className="text-lg lg:text-xl font-light text-zara-gray max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover a curated selection of premium courses designed to transform your skills and accelerate your career.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-6 sm:flex sm:justify-center">
            <Link
              to="/register"
              className="inline-block w-full sm:w-auto px-8 py-4 text-sm font-light tracking-zara uppercase bg-zara-black text-zara-white hover:bg-zara-charcoal transition-colors duration-300"
            >
              Start Your Journey
            </Link>
            <Link
              to="/login"
              className="inline-block w-full sm:w-auto px-8 py-4 text-sm font-light tracking-zara uppercase border border-zara-black text-zara-black hover:bg-zara-black hover:text-zara-white transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Grid */}
      <section className="py-20 border-t border-zara-lightsilver">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20">
            <div className="space-y-12">
              <div>
                <h3 className="text-lg font-normal text-zara-black mb-4 tracking-zara uppercase">
                  Premium Content
                </h3>
                <p className="text-zara-gray font-light leading-relaxed">
                  Access carefully curated courses created by industry experts. Each lesson is crafted to deliver maximum value and practical knowledge.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-normal text-zara-black mb-4 tracking-zara uppercase">
                  AI Assistant
                </h3>
                <p className="text-zara-gray font-light leading-relaxed">
                  Get instant, personalized guidance with our intelligent assistant. Available 24/7 to answer questions and provide support.
                </p>
              </div>
            </div>
            
            <div className="space-y-12">
              <div>
                <h3 className="text-lg font-normal text-zara-black mb-4 tracking-zara uppercase">
                  Progress Tracking
                </h3>
                <p className="text-zara-gray font-light leading-relaxed">
                  Monitor your learning journey with detailed analytics. Track completion rates and identify areas for improvement.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-normal text-zara-black mb-4 tracking-zara uppercase">
                  Certification
                </h3>
                <p className="text-zara-gray font-light leading-relaxed">
                  Earn verified certificates upon course completion. Showcase your new skills and enhance your professional profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-zara-offwhite">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-light text-zara-black mb-2">10,000+</div>
              <div className="text-sm font-light text-zara-gray tracking-zara uppercase">Students</div>
            </div>
            <div>
              <div className="text-4xl font-light text-zara-black mb-2">500+</div>
              <div className="text-sm font-light text-zara-gray tracking-zara uppercase">Courses</div>
            </div>
            <div>
              <div className="text-4xl font-light text-zara-black mb-2">95%</div>
              <div className="text-sm font-light text-zara-gray tracking-zara uppercase">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-light text-zara-black mb-8 tracking-wide">
            Ready to Transform Your
            <br />
            <em className="font-serif">Career?</em>
          </h2>
          <p className="text-lg font-light text-zara-gray mb-12 leading-relaxed">
            Join thousands of professionals who have elevated their skills through our platform.
          </p>
          <Link
            to="/register"
            className="inline-block px-12 py-4 text-sm font-light tracking-zara uppercase bg-zara-black text-zara-white hover:bg-zara-charcoal transition-colors duration-300"
          >
            Begin Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zara-lightsilver bg-zara-offwhite">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-serif font-normal text-zara-black tracking-wide">
                LEARNHUB
              </h3>
            </div>
            <div className="text-sm font-light text-zara-gray">
              © 2024 LearnHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage