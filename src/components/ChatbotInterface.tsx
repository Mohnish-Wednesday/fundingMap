import React, { useState, useEffect } from 'react';
import { X, Send, Bot, User, Download, ExternalLink, Rocket, Target, MapPin, Building2, Globe, Smartphone, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  messageNumber: number;
}

interface ChatbotInterfaceProps {
  onClose: () => void;
}

interface CompetitorData {
  name: string;
  description: string;
  website: string;
  funding_stage: string;
  total_funding: string;
  key_features: string[];
  target_audience: string;
  business_model: string;
  region: string;
  sub_category: string;
  year_founded: number | string;
}

interface CompanyInfo {
  description: string;
  domain: string;
  target_market: string;
  unique_value: string;
}

// API Configuration
const API_KEY = 'AIzaSyB5M8si59tkFbcaAiz6-8D6nXLFNeIjJX8';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Base system prompt
const BASE_PROMPT = `You are FundingMap AI, a specialized assistant for startup funding and competitor analysis.`;

// Step-specific prompts
const getPrompts = (companyInfo: CompanyInfo | null) => ({
  company_info: `${BASE_PROMPT}
To help you better, please tell me about your company:
1. What does your company do?
2. What industry/domain are you in?
3. Who is your target market?
4. What makes your company unique?`,

  initial: `${BASE_PROMPT}
Based on your company profile:
${companyInfo ? `
• Company Focus: ${companyInfo.description}
• Domain: ${companyInfo.domain}
• Target Market: ${companyInfo.target_market}
• Unique Value: ${companyInfo.unique_value}
` : ''}

Would you like to:
1. Analyze specific competitors you have in mind
2. Discover potential competitors in your space`,

  have_competitors: `${BASE_PROMPT}
I'll analyze your known competitors. Please provide:
1. Competitor names or websites
2. Any specific aspects you want to analyze (funding, investors, growth)`,

  no_competitors_domain: `${BASE_PROMPT}
Return ONLY a JSON array of competitors in the following format, with no additional text or messages:
[
  {
    "name": "Company Name",
    "description": "Company description",
    "website": "company-website.com",
    "funding_stage": "Funding stage",
    "total_funding": "Total funding amount",
    "key_features": ["Feature 1", "Feature 2"],
    "target_audience": "Target market description",
    "business_model": "Business model description",
    "region": "Geographic focus",
    "sub_category": "Specific category",
    "year_founded": "Year"
  }
]`,

  competitor_selection: `${BASE_PROMPT}
Based on the selected competitors, I'll provide:
1. Comparative analysis
2. Investment patterns
3. Market opportunities
4. Strategic insights`,

  analysis: `${BASE_PROMPT}
Based on the competitor data, I'll provide:
1. Comparative analysis
2. Investment patterns
3. Market opportunities
4. Strategic insights`
});

// Domain-specific competitor data
const DOMAIN_COMPETITORS = {
  'Healthcare': {
    'Mental Health': {
      'India': [
        {
          name: "Wysa",
          website: "wysa.io",
          appLink: "apps.apple.com/us/app/wysa-mental-health-support/id1166585565",
          totalFunding: "$29.3M",
          rounds: [
            { stage: "Series A", amount: "$20M", date: "2022", investors: ["HealthQuad", "British International Investment", "W Health Ventures"] },
            { stage: "Seed", amount: "$9.3M", date: "2021", investors: ["pi Ventures", "Kae Capital"] }
          ],
          keyInvestors: [
            {
              name: "HealthQuad",
              type: "Healthcare VC",
              focus: "Digital Health",
              linkedin: "linkedin.com/company/healthquad",
              email: "info@healthquad.in"
            },
            {
              name: "W Health Ventures",
              type: "Healthcare VC",
              focus: "Digital Health Innovation",
              linkedin: "linkedin.com/company/w-health-ventures",
              email: "contact@whealthventures.com"
            }
          ]
        },
        {
          name: "YourDOST",
          website: "yourdost.com",
          totalFunding: "$12M",
          rounds: [
            { stage: "Series B", amount: "$10M", date: "2023", investors: ["Lightbox Ventures", "Chiratae Ventures"] },
            { stage: "Series A", amount: "$2M", date: "2020", investors: ["SAIF Partners", "Innoven Capital"] }
          ],
          keyInvestors: [
            {
              name: "Lightbox Ventures",
              type: "VC Firm",
              focus: "Consumer Technology",
              linkedin: "linkedin.com/company/lightbox-ventures",
              email: "info@lightbox.vc"
            }
          ]
        },
        {
          name: "Mindpeers",
          website: "mindpeers.co",
          appLink: "play.google.com/store/apps/details?id=co.mindpeers.app",
          totalFunding: "$7M",
          rounds: [
            { stage: "Series A", amount: "$5M", date: "2023", investors: ["Surge Ventures", "Nexus Venture Partners"] },
            { stage: "Seed", amount: "$2M", date: "2022", investors: ["Y Combinator", "Better Capital"] }
          ],
          keyInvestors: [
            {
              name: "Surge Ventures",
              type: "Accelerator VC",
              focus: "Early Stage Startups",
              linkedin: "linkedin.com/company/surge-ventures",
              email: "contact@surge.ventures"
            }
          ]
        },
        {
          name: "InnerHour",
          website: "theinnerhour.com",
          totalFunding: "$5.2M",
          rounds: [
            { stage: "Series A", amount: "$3.5M", date: "2022", investors: ["Lightbox Ventures", "Capier Investments"] },
            { stage: "Seed", amount: "$1.7M", date: "2020", investors: ["Lightrock India", "Angels"] }
          ],
          keyInvestors: [
            {
              name: "Lightrock India",
              type: "Impact VC",
              focus: "Healthcare & Education",
              linkedin: "linkedin.com/company/lightrock",
              email: "india@lightrock.com"
            }
          ]
        }
      ],
      'United States': [
        // US competitors data here
      ],
      // Other regions
    },
    'Telemedicine': {
      // Telemedicine competitors by region
    },
    // Other healthcare subdomains
  },
  // Other domains
};

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<'company_info' | 'initial' | 'have_competitors' | 'no_competitors_domain' | 'competitor_selection' | 'analysis'>('company_info');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hasCompetitors, setHasCompetitors] = useState<boolean | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [appLink, setAppLink] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedSubdomain, setSelectedSubdomain] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [competitorsList, setCompetitorsList] = useState<CompetitorData[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [messageCount, setMessageCount] = useState(0);

  const domains = [
    'E-commerce', 'Fintech', 'Healthcare', 'EdTech', 'SaaS', 'AI/ML',
    'Food & Beverage', 'Travel', 'Real Estate', 'Gaming', 'Social Media'
  ];

  const subdomains = {
    'E-commerce': ['Marketplace', 'D2C Brands', 'B2B Commerce', 'Dropshipping'],
    'Fintech': ['Payments', 'Lending', 'Crypto', 'Insurance', 'Wealth Management'],
    'Healthcare': ['Telemedicine', 'Mental Health', 'Medical Devices', 'Pharma'],
    'EdTech': ['K-12', 'Higher Ed', 'Corporate Training', 'Language Learning'],
    'SaaS': ['CRM', 'HR Tech', 'Marketing', 'Analytics', 'Productivity'],
    'AI/ML': ['Computer Vision', 'NLP', 'Automation', 'Data Analytics']
  };

  const regions = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Netherlands',
    'Singapore', 'Australia', 'India', 'Japan', 'South Korea', 'Brazil', 'Mexico',
    'Israel', 'Sweden', 'Switzerland', 'Other'
  ];

  const mockCompetitorData: CompetitorData[] = [
    {
      name: "Wysa",
      description: "AI-powered mental health chatbot and therapy platform",
      website: "wysa.io",
      funding_stage: "Series A",
      total_funding: "$29.3M",
      key_features: [
        "AI chatbot for mental health",
        "Professional therapy sessions",
        "Self-help tools and exercises"
      ],
      target_audience: "Individuals seeking mental health support",
      business_model: "Freemium with subscription options",
      region: "India, Global",
      sub_category: "Mental Health App",
      year_founded: 2015
    },
    {
      name: "YourDOST",
      description: "Online counseling and emotional wellness platform",
      website: "yourdost.com",
      funding_stage: "Series B",
      total_funding: "$12M",
      key_features: [
        "Online counseling",
        "Expert consultations",
        "Corporate wellness programs"
      ],
      target_audience: "Students and working professionals",
      business_model: "B2B and B2C subscriptions",
      region: "India",
      sub_category: "Online Counseling",
      year_founded: 2014
    }
  ];

  const getCurrentPrompt = () => {
    const prompts = getPrompts(companyInfo);
    return prompts[currentStep];
  };

  const addMessage = (type: 'bot' | 'user', content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      messageNumber: type === 'user' ? messageCount + 1 : messageCount
    };
    setMessages(prev => [...prev, newMessage]);
    if (type === 'user') {
      setMessageCount(prev => prev + 1);
    }
  };

  const handleCompanyInfo = (message: string) => {
    try {
      // Extract company information from the message
      const info: CompanyInfo = {
        description: '',
        domain: '',
        target_market: '',
        unique_value: ''
      };

      // Simple parsing of the message to extract information
      const lines = message.split('\n');
      lines.forEach(line => {
        if (line.toLowerCase().includes('company') || line.toLowerCase().includes('do')) {
          info.description = line.split(':')[1]?.trim() || line;
        } else if (line.toLowerCase().includes('industry') || line.toLowerCase().includes('domain')) {
          info.domain = line.split(':')[1]?.trim() || line;
        } else if (line.toLowerCase().includes('target')) {
          info.target_market = line.split(':')[1]?.trim() || line;
        } else if (line.toLowerCase().includes('unique')) {
          info.unique_value = line.split(':')[1]?.trim() || line;
        }
      });

      setCompanyInfo(info);
      setCurrentStep('initial');
      
      // Add a transition message
      addMessage('bot', 
        `Thank you for sharing about your company. Based on your profile, I can help you analyze your competitive landscape. ` +
        `Would you like to analyze specific competitors you have in mind, or would you like me to help discover potential competitors in your space?`
      );
    } catch (error) {
      console.error('Error processing company info:', error);
      addMessage('bot', 'Could you please provide your company information in a clearer format? Include details about what your company does, your industry, target market, and unique value proposition.');
    }
  };

  const sendMessageToAI = async (messageContent: string) => {
    try {
      console.log('Starting AI request for step:', currentStep);
      setIsTyping(true);

      // For company info step, handle differently
      if (currentStep === 'company_info') {
        handleCompanyInfo(messageContent);
        setIsTyping(false);
        return;
      }

      // Create conversation history with message numbers
      const conversationHistory = messages.map(msg => ({
        text: `${msg.type === 'user' ? 'User' : 'Assistant'} [${msg.messageNumber}]: ${msg.content}`
      })).join('\n');

      // Add context based on current step and company info
      let contextualPrompt = getCurrentPrompt();
      if (currentStep === 'no_competitors_domain' && selectedDomain && selectedSubdomain && selectedRegion) {
        contextualPrompt += `\nProvide competitor data for ${selectedDomain}, specifically ${selectedSubdomain} in ${selectedRegion}, ` +
          `considering the company profile: ${companyInfo?.description}. Return ONLY the JSON array with no additional text.`;
      }

      const requestBody = {
        contents: [{
          parts: [
            {
              text: contextualPrompt
            },
            {
              text: `Previous conversation:\n${conversationHistory}\n\nCurrent user message [${messageCount + 1}]: ${messageContent}`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        }
      };

      console.log('Making API request with context:', requestBody);

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${data.error?.message || 'Unknown error'}`);
      }

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const reply = data.candidates[0].content.parts[0].text;
        
        // Try to parse competitor data if it's in the response
        try {
          if (currentStep === 'no_competitors_domain') {
            // Clean the response to get just the JSON array
            const cleanJson = reply.replace(/```json\n|\n```/g, '').trim();
            const competitorData = JSON.parse(cleanJson);
            
            if (Array.isArray(competitorData)) {
              console.log('Parsed competitor data:', competitorData);
              
              // Add a summary message without showing the JSON
              addMessage('bot', 
                `I've identified ${competitorData.length} major competitors in the ${selectedSubdomain} space in ${selectedRegion}. ` +
                `Please review the list below and select the ones you'd like to analyze in detail.`
              );

              // Update the competitors list and step
              setCompetitorsList(competitorData);
              setCurrentStep('competitor_selection');
              return;
            }
          } else {
            // For other steps, show the reply as is
            addMessage('bot', reply);
          }
        } catch (error) {
          console.error('Error parsing competitor data:', error);
          addMessage('bot', 'Sorry, there was an error processing the competitor data. Please try again.');
        }
      } else {
        throw new Error('Invalid response format from AI');
      }

    } catch (error) {
      console.error('Full error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addMessage('bot', `Sorry, I encountered an error: ${errorMessage}. Please try again.`);
    } finally {
      setIsTyping(false);
    }
  };

  // Initialize chat with welcome message
  useEffect(() => {
    // Initialize with empty state
    setMessages([]);
    setCurrentStep('company_info');
    setCompanyInfo(null);
    setHasCompetitors(null);
    setWebsiteUrl('');
    setAppLink('');
    setSelectedDomain('');
    setSelectedSubdomain('');
    setSelectedRegion('');
    setCompetitorsList([]);
    setSelectedCompetitors([]);
    setInputValue('');
    setMessageCount(0);

    // Add initial welcome message
    addMessage('bot', 'Welcome! Before we analyze your competitors, please tell me about your company. What does your company do, what industry are you in, who is your target market, and what makes your company unique?');
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    try {
      const userMessage = inputValue.trim();
      setInputValue('');
      addMessage('user', userMessage);

      // Prevent multiple messages while processing
      if (isTyping) {
        return;
      }

      await sendMessageToAI(userMessage);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      addMessage('bot', 'Sorry, there was an error processing your message. Please try again.');
    }
  };

  const handleCompetitorChoice = async (hasCompetitorsChoice: boolean) => {
    try {
      setHasCompetitors(hasCompetitorsChoice);
      if (hasCompetitorsChoice) {
        addMessage('user', 'Yes, I have competitors in mind');
        setCurrentStep('have_competitors');
        await sendMessageToAI("Yes, I have specific competitors in mind.");
      } else {
        addMessage('user', 'No, I need help finding competitors');
        setCurrentStep('no_competitors_domain');
        await sendMessageToAI("No, I need help discovering competitors in my domain.");
      }
    } catch (error) {
      console.error('Error in handleCompetitorChoice:', error);
      addMessage('bot', 'Sorry, there was an error processing your choice. Please try again.');
      setHasCompetitors(null);
      setCurrentStep('initial');
    }
  };

  const handleCompetitorDetails = async () => {
    try {
      let message = '';
      if (!websiteUrl && !appLink) {
        message = "I don't have website or app details, but I know my competitors";
        addMessage('user', message);
      } else {
        message = `Here are my competitor details - Website: ${websiteUrl || 'Not provided'}, App: ${appLink || 'Not provided'}`;
        addMessage('user', message);
      }
      
      setCompetitorsList(mockCompetitorData);
      setCurrentStep('competitor_selection');
      await sendMessageToAI(message);
    } catch (error) {
      console.error('Error in handleCompetitorDetails:', error);
      addMessage('bot', 'Sorry, there was an error processing the competitor details. Please try again.');
    }
  };

  const handleDomainSelection = async () => {
    try {
      if (!selectedDomain || !selectedSubdomain || !selectedRegion) {
        addMessage('bot', 'Please select all required fields (domain, subdomain, and region).');
        return;
      }

      console.log('Selected values:', {
        domain: selectedDomain,
        subdomain: selectedSubdomain,
        region: selectedRegion
      });

      const message = `I'm interested in the ${selectedDomain} industry, specifically ${selectedSubdomain} in ${selectedRegion}.`;
      addMessage('user', message);

      // Send message to AI first to get competitor data
      await sendMessageToAI(message);

    } catch (error) {
      console.error('Error in handleDomainSelection:', error);
      addMessage('bot', 'Sorry, there was an error processing your domain selection. Please try again.');
    }
  };

  // Domain selection handlers
  const handleDomainChange = (value: string) => {
    console.log('Domain changed to:', value);
    setSelectedDomain(value);
    // Reset subdomain when domain changes
    setSelectedSubdomain('');
  };

  const handleSubdomainChange = (value: string) => {
    console.log('Subdomain changed to:', value);
    setSelectedSubdomain(value);
  };

  const handleRegionChange = (value: string) => {
    console.log('Region changed to:', value);
    setSelectedRegion(value);
  };

  const handleFinalAnalysis = async () => {
    try {
      if (selectedCompetitors.length === 0) {
        addMessage('bot', 'Please select at least one competitor to analyze.');
        return;
      }

      const message = `Please analyze these competitors: ${selectedCompetitors.join(', ')}`;
      addMessage('user', message);
      setCurrentStep('analysis');
      await sendMessageToAI(message);
    } catch (error) {
      console.error('Error in handleFinalAnalysis:', error);
      addMessage('bot', 'Sorry, there was an error generating the analysis. Please try again.');
    }
  };

  const toggleCompetitor = (competitorName: string) => {
    setSelectedCompetitors(prev => 
      prev.includes(competitorName) 
        ? prev.filter(name => name !== competitorName)
        : [...prev, competitorName]
    );
  };

  // Render competitor cards
  const renderCompetitorCards = () => {
    if (currentStep === 'competitor_selection' && competitorsList.length > 0) {
      return (
        <div className="space-y-4">
          <div className="text-sm text-slate-600 mb-4">
            Select competitors to analyze (toggle to see details):
          </div>
          {competitorsList.map((competitor, index) => (
            <div key={index} className="space-y-2">
              <Toggle
                pressed={selectedCompetitors.includes(competitor.name)}
                onPressedChange={() => toggleCompetitor(competitor.name)}
                className="w-full justify-start p-4 h-auto"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{competitor.name}</div>
                    <div className="text-sm text-slate-600">
                      {competitor.website && <span>🌐 {competitor.website}</span>}
                      <span className="ml-2 text-green-600 font-medium">{competitor.total_funding}</span>
                    </div>
                  </div>
                </div>
              </Toggle>
              
              {selectedCompetitors.includes(competitor.name) && (
                <Card className="ml-8 border border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Description */}
                      <div>
                        <h5 className="font-semibold text-slate-700 mb-2">Description:</h5>
                        <p className="text-sm text-slate-600">{competitor.description}</p>
                      </div>

                      {/* Key Features */}
                      <div>
                        <h5 className="font-semibold text-slate-700 mb-2">Key Features:</h5>
                        <div className="space-y-1">
                          {competitor.key_features.map((feature, idx) => (
                            <div key={idx} className="text-sm text-slate-600 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Business Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-slate-700 mb-2">Business Details:</h5>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Founded:</span> {competitor.year_founded}</p>
                            <p><span className="font-medium">Stage:</span> {competitor.funding_stage}</p>
                            <p><span className="font-medium">Model:</span> {competitor.business_model}</p>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-700 mb-2">Market Focus:</h5>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Region:</span> {competitor.region}</p>
                            <p><span className="font-medium">Category:</span> {competitor.sub_category}</p>
                            <p><span className="font-medium">Audience:</span> {competitor.target_audience}</p>
                          </div>
                        </div>
                      </div>

                      {/* Visit Website Button */}
                      <div className="mt-4">
                        <a 
                          href={competitor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Visit Website</span>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
          
          {selectedCompetitors.length > 0 && (
            <Button 
              onClick={handleFinalAnalysis}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Full Report ({selectedCompetitors.length} competitors)
            </Button>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[700px] bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">FundingMap Assistant</h3>
                <p className="text-sm text-slate-600">
                  {currentStep === 'company_info' ? 'Tell me about your company' : 'Discover Your Competitors\' Investors'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages and Competitor Cards */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-900'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <Bot className="w-4 h-4 mt-0.5 text-blue-600" />
                    )}
                    {message.type === 'user' && (
                      <User className="w-4 h-4 mt-0.5 text-white" />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Render competitor cards */}
            {renderCompetitorCards()}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t bg-slate-50">
            {currentStep === 'initial' && hasCompetitors === null && (
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleCompetitorChoice(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-4"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Yes, I have competitors
                  </Button>
                  <Button 
                    onClick={() => handleCompetitorChoice(false)}
                    variant="outline"
                    className="py-4"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    No, help me find them
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'have_competitors' && (
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Competitor Website URL (optional)</Label>
                  <Input
                    id="website"
                    placeholder="https://competitor.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appstore">App Store / Play Store URL (optional)</Label>
                  <Input
                    id="appstore"
                    placeholder="https://apps.apple.com/... or https://play.google.com/..."
                    value={appLink}
                    onChange={(e) => setAppLink(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={handleCompetitorDetails} className="flex-1">
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                  <Button onClick={handleCompetitorDetails} variant="outline" className="flex-1">
                    <Smartphone className="w-4 h-4 mr-2" />
                    App Link
                  </Button>
                  <Button onClick={handleCompetitorDetails} variant="outline" className="flex-1">
                    Don't Have
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'no_competitors_domain' && (
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label>Select Domain</Label>
                  <Select value={selectedDomain} onValueChange={handleDomainChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your industry domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain) => (
                        <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDomain && (
                  <div className="space-y-2">
                    <Label>Select Subdomain</Label>
                    <Select value={selectedSubdomain} onValueChange={handleSubdomainChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose specific area" />
                      </SelectTrigger>
                      <SelectContent>
                        {subdomains[selectedDomain as keyof typeof subdomains]?.map((subdomain) => (
                          <SelectItem key={subdomain} value={subdomain}>{subdomain}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Select Region</Label>
                  <Select value={selectedRegion} onValueChange={handleRegionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your target region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleDomainSelection} 
                  disabled={!selectedDomain || !selectedSubdomain || !selectedRegion}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Find Competitors
                </Button>
              </div>
            )}

            {/* Always show the chat input */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatbotInterface;
