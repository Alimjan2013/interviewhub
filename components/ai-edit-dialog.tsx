"use client"

import * as React from "react"
import { Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface AIEditDialogProps {
  currentStory: string
  onUpdate: (newStory: string) => void
}

interface Demographics {
  age: string
  gender: string
  location: string
  education: string
  jobTitle: string
  income: string
  familyLife: string
}

interface Theme {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const themes: Theme[] = [
  {
    id: "financial",
    title: "Financial Services Professional",
    description: "Background in banking, investments, or financial planning",
    icon: "💼",
  },
  {
    id: "sports",
    title: "Sports Enthusiast",
    description: "Passionate about sports, either as a player or fan",
    icon: "⚽",
  },
  {
    id: "healthcare",
    title: "Healthcare Experience",
    description: "Background in medical care or patient experience",
    icon: "🏥",
  },
  {
    id: "tech",
    title: "Technology Professional",
    description: "Experience in software, IT, or digital innovation",
    icon: "💻",
  },
  {
    id: "education",
    title: "Education Background",
    description: "Experience in teaching or academic environment",
    icon: "📚",
  },
  {
    id: "creative",
    title: "Creative Professional",
    description: "Background in arts, design, or creative industries",
    icon: "🎨",
  },
]

const incomeRanges = [
  "Under $30,000",
  "$30,000-$60,000",
  "$60,000-$100,000",
  "$100,000-$150,000",
  "$150,000-$200,000",
  "Above $200,000",
]

const educationLevels = [
  "High School",
  "Some College",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD/Doctorate",
]

export function AIEditDialog({ currentStory, onUpdate }: AIEditDialogProps) {
  console.log("currentStory", currentStory)
  const [isOpen, setIsOpen] = React.useState(false)
  const [step, setStep] = React.useState(1)
  const [demographics, setDemographics] = React.useState<Demographics>({
    age: "",
    gender: "",
    location: "",
    education: "",
    jobTitle: "",
    income: "",
    familyLife: "",
  })
  const [selectedThemes, setSelectedThemes] = React.useState<string[]>([])
  const [aiQuestions, setAiQuestions] = React.useState<{ question: string; answer: string }[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [generatedStory, setGeneratedStory] = React.useState("")
  const [error, setError] = React.useState("")
  const [loadingState, setLoadingState] = useState<{
    status: "idle" | "generating-questions" | "generating-story"
    message: string
  }>({
    status: "idle",
    message: "",
  })

  const handleDemographicsChange = (field: keyof Demographics, value: string) => {
    setDemographics((prev) => ({ ...prev, [field]: value }))
  }

  const handleThemeToggle = (themeId: string) => {
    setSelectedThemes((prev) => {
      if (prev.includes(themeId)) {
        return prev.filter((id) => id !== themeId)
      }
      if (prev.length < 3) {
        return [...prev, themeId]
      }
      return prev
    })
  }

  const generateAIQuestions = async () => {
    setIsLoading(true)
    setLoadingState({
      status: "generating-questions",
      message: "AI is analyzing your profile and generating relevant questions...",
    })
    setError("")

    try {
      const prompt = `Based on the following profile:
      Demographics:
      - Age: ${demographics.age}
      - Gender: ${demographics.gender}
      - Location: ${demographics.location}
      - Education: ${demographics.education}
      - Job Title: ${demographics.jobTitle}
      - Income Range: ${demographics.income}
      - Family Life Goals: ${demographics.familyLife}

      Selected Themes:
      ${selectedThemes
        .map((id) => {
          const theme = themes.find((t) => t.id === id)
          return `- ${theme?.title}: ${theme?.description}`
        })
        .join("\n")}
      `

      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate questions")
      }

      const data = await response.json()

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format from AI")
      }

      const questions = data.questions.map((q: string) => ({
        question: q,
        answer: "",
      }))

      setAiQuestions(questions)
      setStep(3)
    } catch (error) {
      console.error("Error generating questions:", error)
      setError(error instanceof Error ? error.message : "Failed to generate questions. Please try again.")
    } finally {
      setIsLoading(false)
      setLoadingState({ status: "idle", message: "" })
    }
  }

  const generateFinalStory = async () => {
    setIsLoading(true)
    setLoadingState({
      status: "generating-story",
      message: "AI is crafting your background story...",
    })
    setError("")

    try {
      const prompt = `Create a detailed background story based on:
      
      Demographics:
      - Age: ${demographics.age}
      - Gender: ${demographics.gender}
      - Location: ${demographics.location}
      - Education: ${demographics.education}
      - Job Title: ${demographics.jobTitle}
      - Income Range: ${demographics.income}
      - Family Life Goals: ${demographics.familyLife}

      Professional Background and Interests:
      ${selectedThemes
        .map((id) => {
          const theme = themes.find((t) => t.id === id)
          return `- ${theme?.title}: ${theme?.description}`
        })
        .join("\n")}

      Additional Details:
      ${aiQuestions.map((q) => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n")}
      `

      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate story")
      }

      const data = await response.json()

      if (!data.story || typeof data.story !== "string") {
        throw new Error("Invalid response format from AI")
      }

      setGeneratedStory(data.story)
    } catch (error) {
      console.error("Error generating story:", error)
      setError(error instanceof Error ? error.message : "Failed to generate story. Please try again.")
    } finally {
      setIsLoading(false)
      setLoadingState({ status: "idle", message: "" })
    }
  }

  const handleFinish = () => {
    onUpdate(generatedStory)
    setIsOpen(false)
    // Reset the form
    setStep(1)
    setDemographics({
      age: "",
      gender: "",
      location: "",
      education: "",
      jobTitle: "",
      income: "",
      familyLife: "",
    })
    setSelectedThemes([])
    setAiQuestions([])
    setGeneratedStory("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Wand2 className="mr-2 h-4 w-4" />
          Edit with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Background Story with AI</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Let's start by gathering some basic information"
              : step === 2
                ? "Select up to three themes that best describe your background"
                : step === 3
                  ? "Answer these AI-generated questions to add more detail to your story"
                  : "Review and edit your generated background story"}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          {/* Progress Steps */}
          <div className="mb-8 flex justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={cn(
                  "flex flex-col items-center",
                  step >= stepNumber ? "text-primary" : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                    step >= stepNumber ? "border-primary bg-primary text-primary-foreground" : "border-muted",
                  )}
                >
                  {stepNumber}
                </div>
                <span className="mt-2 text-xs">
                  {stepNumber === 1
                    ? "Demographics"
                    : stepNumber === 2
                      ? "Themes"
                      : stepNumber === 3
                        ? "Details"
                        : "Review"}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Demographics */}
          {step === 1 && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={demographics.age}
                    onChange={(e) => handleDemographicsChange("age", e.target.value)}
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={demographics.gender}
                    onValueChange={(value) => handleDemographicsChange("gender", value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={demographics.location}
                  onChange={(e) => handleDemographicsChange("location", e.target.value)}
                  placeholder="City, State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Select
                  value={demographics.education}
                  onValueChange={(value) => handleDemographicsChange("education", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={demographics.jobTitle}
                  onChange={(e) => handleDemographicsChange("jobTitle", e.target.value)}
                  placeholder="e.g., Financial Analyst"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="income">Income Range</Label>
                <Select
                  value={demographics.income}
                  onValueChange={(value) => handleDemographicsChange("income", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyLife">Family Life Goals</Label>
                <Input
                  id="familyLife"
                  value={demographics.familyLife}
                  onChange={(e) => handleDemographicsChange("familyLife", e.target.value)}
                  placeholder="e.g., Planning to start a family in 2-3 years"
                />
              </div>
            </div>
          )}

          {/* Step 2: Themes */}
          {step === 2 && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                {themes.map((theme) => (
                  <Card
                    key={theme.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted",
                      selectedThemes.includes(theme.id) && "border-primary bg-primary/5",
                    )}
                    onClick={() => handleThemeToggle(theme.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{theme.icon}</span>
                        <div>
                          <h3 className="font-medium">{theme.title}</h3>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Selected: {selectedThemes.length}/3 themes</p>
            </div>
          )}

          {/* Step 3: AI Generated Questions */}
          {step === 3 && (
            <div className="space-y-4 overflow-y-auto pr-4" style={{ maxHeight: "50vh" }}>
              {aiQuestions.map((q, index) => (
                <div key={index} className="space-y-2">
                  <Label>{q.question}</Label>
                  <Textarea
                    value={q.answer}
                    onChange={(e) =>
                      setAiQuestions((prev) =>
                        prev.map((question, i) => (i === index ? { ...question, answer: e.target.value } : question)),
                      )
                    }
                    placeholder="Your answer..."
                    className="min-h-[100px]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <Textarea
                value={generatedStory}
                onChange={(e) => setGeneratedStory(e.target.value)}
                className="min-h-[300px]"
                placeholder="Generating your story..."
              />
            </div>
          )}

          {loadingState.status !== "idle" && (
            <div className="mt-4 mb-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">{loadingState.message}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep((prev) => Math.max(1, prev - 1))} disabled={step === 1}>
              Previous
            </Button>
            {step < 4 ? (
              <Button
                onClick={() => {
                  if (step === 2 && selectedThemes.length > 0) {
                    generateAIQuestions()
                  } else if (step === 3) {
                    generateFinalStory()
                    setStep(4)
                  } else {
                    setStep((prev) => prev + 1)
                  }
                }}
                disabled={
                  (step === 1 && Object.values(demographics).some((value) => !value)) ||
                  (step === 2 && selectedThemes.length === 0) ||
                  (step === 3 && aiQuestions.some((q) => !q.answer)) ||
                  isLoading
                }
              >
                {isLoading
                  ? loadingState.status === "generating-questions"
                    ? "Generating Questions..."
                    : loadingState.status === "generating-story"
                      ? "Generating Story..."
                      : "Processing..."
                  : step === 3
                    ? "Generate Story"
                    : "Next"}
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={!generatedStory}>
                Save Story
              </Button>
            )}
          </div>
        </div>
        {error && <div className="mt-4 text-red-500">{error}</div>}
      </DialogContent>
    </Dialog>
  )
}

