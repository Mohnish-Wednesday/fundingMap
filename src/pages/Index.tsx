import React, { useState } from 'react';
import { ArrowRight, Search, Download, Zap, Database, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatbotInterface from '@/components/ChatbotInterface';
import FeatureCard from '@/components/FeatureCard';
import Footer from '@/components/Footer';

const Index = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 backdrop-blur-md bg-white/80 border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              FundingMap
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-blue-700 text-sm font-medium">AI-Powered Competitor Intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent mb-6">
            Find Out Who's Fueling Your
            <span className="block bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Competitors' Growth
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover the investors, funding rounds, and market players behind your competition. 
            Get instant insights into funding patterns and strategic opportunities in your industry.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => setShowChatbot(true)}
            >
              Start Search
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg rounded-xl">
              Watch Demo
            </Button>
          </div>

          {/* Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Search className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-800 mb-2">Smart Discovery</h3>
                <p className="text-slate-600 text-sm">AI-powered search across funding databases</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Database className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-800 mb-2">Live Data</h3>
                <p className="text-slate-600 text-sm">Real-time scraping of investment data</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Download className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-800 mb-2">Export Reports</h3>
                <p className="text-slate-600 text-sm">Download detailed PDF reports</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Chatbot Interface */}
      {showChatbot && (
        <ChatbotInterface onClose={() => setShowChatbot(false)} />
      )}

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Outpace Competition
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive competitor intelligence at your fingertips
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="AI-Powered Search"
              description="Advanced algorithms analyze funding patterns and investor networks"
              color="blue"
            />
            <FeatureCard 
              icon={<Database className="w-8 h-8" />}
              title="Live Scraping"
              description="Real-time data from Crunchbase, AngelList, and 50+ sources"
              color="green"
            />
            <FeatureCard 
              icon={<Target className="w-8 h-8" />}
              title="Market Insights"
              description="Discover key players and funding trends in any industry"
              color="purple"
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Investor Networks"
              description="Map relationships between VCs, angels, and portfolio companies"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600">
              Three simple steps to competitor intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tell Us Your Target",
                description: "Enter a competitor name or choose your industry domain"
              },
              {
                step: "02",
                title: "AI Does the Work",
                description: "Our system scrapes and analyzes funding data across multiple sources"
              },
              {
                step: "03",
                title: "Get Your Report",
                description: "Receive detailed insights and export as PDF for your team"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Discover Your Competitors' Secrets?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 1,000+ founders who use FindingMap to stay ahead of the competition
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-xl shadow-lg"
              onClick={() => setShowChatbot(true)}
            >
              Start Free Search
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg rounded-xl"
            >
              Request Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
