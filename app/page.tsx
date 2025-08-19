"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  FileText,
  Target,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Mail,
  Globe,
  Menu,
  X,
  UserCircle,
  Settings,
  Sparkles,
  Brain,
  Download,
  Users,
} from "lucide-react"
import Image from "next/image"

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { logoutUser } from "@/lib/redux/slices/authSlice"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Resume Creation",
    description:
      "Generate professional resumes tailored to your career goals with advanced AI technology that understands industry requirements.",
    color: "resumaic-gradient-green",
  },
  {
    icon: FileText,
    title: "Smart Template Library",
    description: "Choose from professionally designed templates optimized for different industries and career levels.",
    color: "resumaic-gradient-orange",
  },
  {
    icon: Target,
    title: "ATS Optimization Engine",
    description:
      "Ensure your resume passes Applicant Tracking Systems with our intelligent keyword optimization and formatting.",
    color: "resumaic-gradient-green",
  },
  {
    icon: Mail,
    title: "Dynamic Cover Letters",
    description:
      "Generate compelling, personalized cover letters that perfectly match job descriptions and company culture.",
    color: "resumaic-gradient-orange",
  },
  {
    icon: Zap,
    title: "Lightning Fast Results",
    description: "Create professional documents in minutes, not hours. Our AI works at the speed of your ambition.",
    color: "resumaic-gradient-green",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description:
      "Your personal data is protected with bank-level encryption. We never share your information with third parties.",
    color: "resumaic-gradient-orange",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Senior Software Engineer",
    company: "Google",
    image: "/placeholder.svg?height=40&width=40",
    content:
      "Resumaic's AI helped me craft the perfect resume that landed me my dream role at Google. The ATS optimization is phenomenal!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Product Manager",
    company: "Microsoft",
    image: "/placeholder.svg?height=40&width=40",
    content:
      "The AI-generated content was so precise and professional. I got 3x more interview calls after using Resumaic.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "UX Design Lead",
    company: "Apple",
    image: "/placeholder.svg?height=40&width=40",
    content:
      "Beautiful templates and intelligent suggestions made creating my portfolio resume effortless. Highly recommended!",
    rating: 5,
  },
]

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with AI resume building",
    features: ["3 AI-generated resumes", "Basic templates", "Cover letter generator", "Email support"],
    popular: false,
    buttonText: "Start Free",
    buttonStyle: "border-2 border-[#70E4A8] text-[#70E4A8] hover:bg-[#70E4A8] hover:text-white",
  },
  {
    name: "Professional",
    price: "$19",
    period: "month",
    description: "Best for active job seekers",
    features: [
      "Unlimited AI resumes",
      "Premium templates",
      "Advanced ATS checker",
      "AI persona generator",
      "Priority support",
      "Multiple export formats",
    ],
    popular: true,
    buttonText: "Start Pro Trial",
    buttonStyle: "resumaic-gradient-green text-white hover:opacity-90",
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "month",
    description: "For teams and organizations",
    features: [
      "Everything in Professional",
      "Team collaboration tools",
      "Custom branding options",
      "Analytics dashboard",
      "API access",
      "Dedicated account manager",
    ],
    popular: false,
    buttonText: "Contact Sales",
    buttonStyle: "bg-[#2D3639] text-white hover:bg-[#1a1f21]",
  },
]

const dashboardMenuItems = [
  {
    id: "create-persona",
    label: "AI Persona",
    icon: Brain,
    badge: "AI",
    href: "/dashboard?page=create-persona",
  },
  {
    id: "resumes",
    label: "My Resumes",
    icon: FileText,
    href: "/dashboard?page=resumes",
  },
  {
    id: "cover-letter",
    label: "Cover Letters",
    icon: Mail,
    href: "/dashboard?page=cover-letter",
  },
  {
    id: "ats-checker",
    label: "ATS Checker",
    icon: CheckCircle,
    badge: "Pro",
    href: "/dashboard?page=ats-checker",
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserCircle,
    href: "/dashboard?page=profile",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard?page=settings",
  },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view")
        }
      })
    }, observerOptions)

    const animateElements = document.querySelectorAll(".scroll-animate")
    animateElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 animate-slide-up">
            <div className="flex items-center gap-3">
            <Link href="/" >
                <Image src="/Resumic.png" alt="Logo" width={200} height= {90}  className="cursor-pointer"/>
            </Link>
            </div>

            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 animate-slide-up stagger-2">
              <a
                href="#features"
                className="text-[#2D3639] hover:text-[#70E4A8] transition-all duration-300 font-medium hover:scale-105"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-[#2D3639] hover:text-[#70E4A8] transition-all duration-300 font-medium hover:scale-105"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-[#2D3639] hover:text-[#70E4A8] transition-all duration-300 font-medium hover:scale-105"
              >
                Success Stories
              </a>

              {user ? (
                <>
                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover-lift">
                        <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-[#70E4A8] transition-all duration-300">
                          <AvatarFallback
                            className={`${
                              user?.role === "admin" ? "bg-[#EA580C]" : "resumaic-gradient-green"
                            } text-white font-semibold`}
                          >
                            {user?.role === "admin" ? (
                              <Settings className="h-5 w-5 animate-bounce-subtle" />
                            ) : user?.name ? (
                              user.name.charAt(0).toUpperCase()
                            ) : (
                              <UserCircle className="h-5 w-5" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2 animate-scale-in" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email || "user@example.com"}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <div className="space-y-1">
                        {dashboardMenuItems.map((item) => (
                          <DropdownMenuItem key={item.id} className="cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                            <a href={item.href} className="flex items-center gap-3 w-full">
                              <div className="p-1.5 rounded-md bg-gray-100">
                                <item.icon className="h-4 w-4 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{item.label}</span>
                                  {item.badge && (
                                    <Badge
                                      variant={item.badge === "AI" ? "default" : "secondary"}
                                      className="text-xs px-1.5 py-0.5"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </div>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="cursor-pointer p-3 rounded-lg hover:bg-gray-50"
                        onClick={handleLogout}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="p-1.5 rounded-md bg-red-100">
                            <ArrowRight className="h-4 w-4 text-red-600 rotate-180" />
                          </div>
                          <span className="font-medium text-gray-900">Sign Out</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      className="resumaic-gradient-green text-white hover:opacity-90 shadow-lg hover-lift button-press "
                    >
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm" className="text-[#2D3639] hover:text-[#70E4A8] hover-lift">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="sm"
                      className="resumaic-gradient-green text-white hover:opacity-90 shadow-lg hover-lift button-press animate-pulse-glow"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hover-lift"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 animate-slide-up">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900">
                  Reviews
                </a>

                {/* Mobile User Section */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-8 w-8 hover-lift">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500">{user?.email || "user@example.com"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dashboardMenuItems.map((item) => (
                      <a
                        key={item.id}
                        href={item.href}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <item.icon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        {item.badge && (
                          <Badge variant={item.badge === "AI" ? "default" : "secondary"} className="text-xs ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-orange-50 animated-gradient">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5 animate-float"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="text-center">
            <Badge className="mb-6 bg-[#70E4A8]/10 text-[#2D3639] border-[#70E4A8]/20 hover:bg-[#70E4A8]/20 animate-slide-up hover-lift">
              <Sparkles className="h-3 w-3 mr-1 animate-bounce-subtle" />
              Powered by Advanced AI Technology
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif text-[#2D3639] mb-6 leading-tight animate-slide-up stagger-1">
              Build Your Dream
              <span className="resumaic-text-gradient block animate-slide-up stagger-2">Career Story</span>
              with AI-Powered Resumes
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up stagger-3">
              Transform your career with intelligent resume building. Our AI creates professional, ATS-optimized resumes
              that get you noticed by top employers and land more interviews.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up stagger-4">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="resumaic-gradient-green text-white hover:opacity-90 text-lg px-8 py-4 shadow-xl hover-lift button-press animate-pulse-glow"
                >
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5 animate-bounce-subtle" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-2 border-[#70E4A8] text-[#2D3639] hover:bg-[#70E4A8] hover:text-white bg-transparent hover-lift button-press"
              >
                <Download className="mr-2 h-5 w-5" />
                View Sample Resume
              </Button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-slide-up stagger-5">
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg hover-lift scroll-animate">
                <div className="text-3xl font-bold text-[#2D3639] font-serif animate-bounce-subtle">150K+</div>
                <div className="text-sm text-gray-600 font-medium">Resumes Created</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg hover-lift scroll-animate stagger-1">
                <div className="text-3xl font-bold text-[#2D3639] font-serif animate-bounce-subtle">98%</div>
                <div className="text-sm text-gray-600 font-medium">ATS Success Rate</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg hover-lift scroll-animate stagger-2">
                <div className="text-3xl font-bold text-[#2D3639] font-serif animate-bounce-subtle">4.9★</div>
                <div className="text-sm text-gray-600 font-medium">User Rating</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg hover-lift scroll-animate stagger-3">
                <div className="text-3xl font-bold text-[#2D3639] font-serif animate-bounce-subtle">24/7</div>
                <div className="text-sm text-gray-600 font-medium">AI Assistant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 scroll-animate">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2D3639] mb-6">
              Powerful Features for Modern Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to create compelling resumes that stand out in today's competitive job market and pass
              through automated screening systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white hover-lift scroll-animate stagger-${(index % 6) + 1}`}
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg animate-float hover-glow`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold font-serif text-[#2D3639]">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-gray-50 to-green-50/30 animated-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 scroll-animate">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2D3639] mb-6">
              Success Stories from Our Users
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals who've transformed their careers with Resumaic's AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-500 hover-lift scroll-animate stagger-${index + 1}`}
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 text-[#EA580C] fill-current animate-bounce-subtle stagger-${i + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-8 text-lg leading-relaxed italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 hover-lift">
                      <AvatarImage src={testimonial.image || "/placeholder.svg"} />
                      <AvatarFallback className="resumaic-gradient-green text-white font-semibold">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-[#2D3639] font-serif">{testimonial.name}</div>
                      <div className="text-sm text-gray-600 font-medium">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 scroll-animate">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2D3639] mb-6">Choose Your Success Plan</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-2 ${plan.popular ? "border-[#70E4A8] shadow-2xl scale-105 animate-pulse-glow" : "border-gray-200 shadow-xl"} bg-white hover-lift scroll-animate stagger-${index + 1} transition-all duration-500`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce-subtle">
                    <Badge className="resumaic-gradient-green text-white px-6 py-2 text-sm font-semibold shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-6 pt-8">
                  <CardTitle className="text-2xl font-bold font-serif text-[#2D3639]">{plan.name}</CardTitle>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-[#2D3639] font-serif animate-bounce-subtle">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 text-lg">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-4 text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 px-8 pb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className={`flex items-center gap-3 animate-slide-up stagger-${featureIndex + 1}`}
                      >
                        <CheckCircle className="h-5 w-5 text-[#70E4A8] flex-shrink-0 animate-bounce-subtle" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/dashboard">
                    <Button
                      className={`w-full ${plan.buttonStyle} text-lg py-3 font-semibold transition-all duration-200 hover-lift button-press`}
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 resumaic-gradient-green animated-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 scroll-animate">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-white mb-8 animate-slide-up">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-green-100 mb-12 leading-relaxed animate-slide-up stagger-1">
            Join over 150,000 professionals who've accelerated their careers with AI-powered resumes that get results.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up stagger-2">
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-10 py-4 bg-white text-[#2D3639] hover:bg-gray-100 shadow-xl font-semibold hover-lift button-press"
              >
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5 animate-bounce-subtle" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-[#70E4A8] bg-transparent font-semibold hover-lift button-press"
            >
              <Users className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D3639] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-animate">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#70E4A8] shadow-lg animate-pulse-glow">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold font-serif">Resumaic</span>
              </div>
              <p className="text-gray-300 mb-8 max-w-md leading-relaxed">
                Empowering professionals worldwide with AI-powered career tools. Build better resumes, land better jobs,
                and accelerate your career growth.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-[#70E4A8] hover:bg-gray-700 hover-lift"
                >
                  <Globe className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-[#70E4A8] hover:bg-gray-700 hover-lift"
                >
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="animate-slide-up stagger-1">
              <h3 className="font-bold font-serif mb-6 text-lg">Product</h3>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a
                    href="#features"
                    className="hover:text-[#70E4A8] transition-all duration-300 hover:scale-105 inline-block"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-[#70E4A8] transition-all duration-300 hover:scale-105 inline-block"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#70E4A8] transition-all duration-300 hover:scale-105 inline-block">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#70E4A8] transition-all duration-300 hover:scale-105 inline-block">
                    API Access
                  </a>
                </li>
              </ul>
            </div>

            <div className="animate-slide-up stagger-2">
              <h3 className="font-bold font-serif mb-6 text-lg">Support</h3>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a href="#" className="hover:text-[#70E4A8] transition-all duration-300 hover:scale-105 inline-block">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#70E4A8] transition-all duration-300 hover:scale-105 inline-block">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#70E4A8] transition-all duration-300 hover:scale-105 inline-block">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#70E4A8] transition-all duration-300 hover:scale-105 inline-block">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-16 pt-8 text-center text-gray-400 animate-fade-in">
            <p>&copy; 2024 Resumaic. All rights reserved. Built with AI for the future of work.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
