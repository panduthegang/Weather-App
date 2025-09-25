import React from 'react';
import { 
  Cloud, 
  MessageCircle, 
  Zap, 
  Globe, 
  Smartphone, 
  Download,
  ArrowRight,
  Star,
  Users,
  Clock,
  Shield,
  Sparkles,
  Bot,
  Sun,
  CloudRain,
  Wind
} from 'lucide-react';

interface LandingPageProps {
  onStartChat: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat, darkMode, toggleTheme }) => {
  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI-Powered Conversations",
      description: "Get intelligent weather insights through natural conversations powered by advanced AI"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Weather Data",
      description: "Access real-time weather information for any location worldwide with pinpoint accuracy"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Get instant weather updates and forecasts in milliseconds, no waiting around"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Optimized",
      description: "Perfect experience across all devices - desktop, tablet, and mobile"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Export Conversations",
      description: "Save and export your weather conversations as PDF for future reference"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy First",
      description: "Your conversations are secure and private, stored locally on your device"
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: "10K+", label: "Active Users" },
    { icon: <MessageCircle className="w-6 h-6" />, value: "50K+", label: "Conversations" },
    { icon: <Globe className="w-6 h-6" />, value: "195", label: "Countries" },
    { icon: <Clock className="w-6 h-6" />, value: "24/7", label: "Available" }
  ];

  const weatherIcons = [
    <Sun className="w-12 h-12 text-yellow-400" />,
    <Cloud className="w-12 h-12 text-gray-400" />,
    <CloudRain className="w-12 h-12 text-blue-400" />,
    <Wind className="w-12 h-12 text-cyan-400" />
  ];

  return (
    <div className="min-h-screen landing-page" data-theme={darkMode ? 'dark' : 'light'}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Cloud className="w-8 h-8 text-blue-500" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-xl font-bold nav-title">WeatherAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors theme-toggle-nav"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
              </button>
              <button
                onClick={onStartChat}
                className="px-6 py-2 rounded-full font-medium transition-all duration-300 nav-cta-btn"
              >
                Start Chatting
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden hero-section">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-icons">
            {weatherIcons.map((icon, index) => (
              <div
                key={index}
                className={`absolute animate-float-${index + 1}`}
                style={{
                  left: `${20 + index * 20}%`,
                  top: `${30 + (index % 2) * 40}%`,
                  animationDelay: `${index * 0.5}s`
                }}
              >
                {icon}
              </div>
            ))}
          </div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full hero-badge">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Powered by Advanced AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight hero-title">
              Weather Insights
              <br />
              <span className="hero-gradient-text">Made Simple</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed hero-subtitle">
              Get instant, intelligent weather information through natural conversations. 
              Ask anything about weather conditions, forecasts, and climate data worldwide.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
              <button
                onClick={onStartChat}
                className="group px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 primary-cta-btn"
              >
                <span className="flex items-center space-x-2">
                  <MessageCircle className="w-6 h-6" />
                  <span>Start Weather Chat</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 secondary-cta-btn">
                <span className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>See Demo</span>
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center stat-item">
                  <div className="flex items-center justify-center mb-2 stat-icon">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold stat-value">{stat.value}</div>
                  <div className="text-sm stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 section-title">
              Why Choose WeatherAI?
            </h2>
            <p className="text-xl max-w-3xl mx-auto section-subtitle">
              Experience the future of weather information with our intelligent, 
              conversational approach to meteorological data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl transition-all duration-300 hover:scale-105 feature-card"
              >
                <div className="feature-icon mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 feature-title">
                  {feature.title}
                </h3>
                <p className="feature-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 cta-section">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold cta-title">
              Ready to Experience Smart Weather?
            </h2>
            <p className="text-xl cta-subtitle">
              Join thousands of users who trust WeatherAI for accurate, 
              intelligent weather insights delivered through natural conversation.
            </p>
            <button
              onClick={onStartChat}
              className="group px-10 py-5 rounded-2xl font-semibold text-xl transition-all duration-300 transform hover:scale-105 final-cta-btn"
            >
              <span className="flex items-center space-x-3">
                <MessageCircle className="w-7 h-7" />
                <span>Get Started Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 footer-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Cloud className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold footer-title">WeatherAI</span>
            </div>
            <div className="text-center md:text-right">
              <p className="footer-text mb-2">
                Made with ❤️ by <span className="font-semibold">Harsh Rathod</span>
              </p>
              <p className="text-sm footer-subtext">
                Bringing intelligent weather insights to everyone
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;