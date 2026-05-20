import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Briefcase, 
  FileText, 
  Palette, 
  Cpu, 
  Calendar, 
  Image as ImageIcon, 
  MessageSquare, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Plus,
  X,
  Upload,
  Check,
  FileUp
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "../lib/utils";
import "./StartProjectForm.css";

// ─── Zod Validation Schema ────────────────────────────────────────────────────
const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().optional(),
  
  projectType: z.enum([
    "Website", 
    "Web App", 
    "Mobile App", 
    "SaaS Platform", 
    "E-commerce", 
    "Branding", 
    "UI/UX Design"
  ], { required_error: "Project type is required" }),
  projectTitle: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  
  features: z.array(z.string()).min(1, "Please add at least one feature"),
  
  referenceLinks: z.array(z.string().url("Must be a valid URL")).default([]),
  designStyle: z.string().optional(),
  
  existingWebsiteUrl: z.string().url("Must be a valid URL").or(z.string().max(0)).optional(),
  techStack: z.string().optional(),
  needCms: z.boolean().default(false),
  needAdminDashboard: z.boolean().default(false),
  integrations: z.string().optional(),
  
  startDate: z.string().min(1, "Desired start date is required"),
  deadline: z.string().min(1, "Target deadline is required"),
  budgetRange: z.enum([
    "Under $1k", 
    "$1k – $5k", 
    "$5k – $10k", 
    "$10k – $25k", 
    "$25k+"
  ], { required_error: "Budget range is required" }),
  
  hasAssets: z.boolean().default(false),
  uploadedLogo: z.string().optional(),
  uploadedGuidelines: z.string().optional(),
  uploadedDocuments: z.string().optional(),
  uploadedMedia: z.string().optional(),
  
  additionalNotes: z.string().optional(),
  agreement: z.boolean().refine((val) => val === true, "You must agree to the terms to submit"),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = [
  { id: 1, title: "Client Details", icon: User },
  { id: 2, title: "Project Overview", icon: Briefcase },
  { id: 3, title: "Features Required", icon: FileText },
  { id: 4, title: "Design Preferences", icon: Palette },
  { id: 5, title: "Technical Requirements", icon: Cpu },
  { id: 6, title: "Timeline & Budget", icon: Calendar },
  { id: 7, title: "Content & Assets", icon: ImageIcon },
  { id: 8, title: "Additional Notes", icon: MessageSquare },
  { id: 9, title: "Agreement", icon: CheckCircle2 },
];

export default function StartProjectForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom states for dynamically adding array inputs
  const [featureInput, setFeatureInput] = useState("");
  const [refLinkInput, setRefLinkInput] = useState("");
  const [refLinkError, setRefLinkError] = useState<string | null>(null);

  // Fake upload file states to visually simulate real dropzones
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(formSchema) as any,
    mode: "all",
    defaultValues: {
      features: [],
      referenceLinks: [],
      needCms: false,
      needAdminDashboard: false,
      hasAssets: false,
      agreement: false,
    },
  });

  // Watch state fields to dynamically persist and control components
  const features = watch("features") || [];
  const referenceLinks = watch("referenceLinks") || [];
  const hasAssets = watch("hasAssets");
  const agreement = watch("agreement");

  // Load saved state from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("devdale_project_form");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof FormData, parsed[key]);
        });
        const savedStep = localStorage.getItem("devdale_project_form_step");
        if (savedStep) setCurrentStep(parseInt(savedStep));
      } catch (e) {
        console.error("Failed to load saved form data", e);
      }
    }
  }, [setValue]);

  // Persist state to local storage on edits
  const currentFormData = watch();
  useEffect(() => {
    localStorage.setItem("devdale_project_form", JSON.stringify(currentFormData));
    localStorage.setItem("devdale_project_form_step", currentStep.toString());
  }, [currentFormData, currentStep]);

  // Dynamic lists managers
  const addFeature = () => {
    const cleanInput = featureInput.trim();
    if (cleanInput) {
      if (!features.includes(cleanInput)) {
        setValue("features", [...features, cleanInput], { shouldValidate: true });
      }
      setFeatureInput("");
    }
  };

  const removeFeature = (idx: number) => {
    const nextFeatures = features.filter((_: string, i: number) => i !== idx);
    setValue("features", nextFeatures, { shouldValidate: true });
  };

  const addReferenceLink = () => {
    const cleanLink = refLinkInput.trim();
    setRefLinkError(null);
    if (!cleanLink) return;

    try {
      z.string().url().parse(cleanLink);
      if (!referenceLinks.includes(cleanLink)) {
        setValue("referenceLinks", [...referenceLinks, cleanLink], { shouldValidate: true });
      }
      setRefLinkInput("");
    } catch {
      setRefLinkError("Please enter a valid URL (including http:// or https://)");
    }
  };

  const removeReferenceLink = (idx: number) => {
    const nextLinks = referenceLinks.filter((_: string, i: number) => i !== idx);
    setValue("referenceLinks", nextLinks, { shouldValidate: true });
  };

  // Simulates file drops/selects with visual premium feedback
  const handleFakeUpload = (type: string, name: string) => {
    setUploadedFiles((prev) => ({ ...prev, [type]: name }));
    setValue(`uploaded${type.charAt(0).toUpperCase() + type.slice(1)}` as any, name);
  };

  const clearFakeUpload = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
    setValue(`uploaded${type.charAt(0).toUpperCase() + type.slice(1)}` as any, undefined);
  };

  // Field validation and navigation per step
  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1: return ["fullName", "email"];
      case 2: return ["projectType", "projectTitle", "description"];
      case 3: return ["features"];
      case 4: return ["referenceLinks"];
      case 5: return ["existingWebsiteUrl"];
      case 6: return ["startDate", "deadline", "budgetRange"];
      case 7: return ["hasAssets"];
      case 8: return ["additionalNotes"];
      case 9: return ["agreement"];
      default: return [];
    }
  };

  const handleNextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Central Submit handler
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    // Map tech fields and custom inputs elegantly into backend API properties
    const platformString = `Tech Stack: ${data.techStack || "N/A"} | CMS: ${data.needCms ? "Yes" : "No"} | Admin Panel: ${data.needAdminDashboard ? "Yes" : "No"} | Site URL: ${data.existingWebsiteUrl || "None"}`;
    const payload = {
      fullName: data.fullName,
      companyName: data.companyName || "N/A",
      email: data.email,
      phone: data.phone || "N/A",
      country: data.country || "N/A",
      projectType: data.projectType,
      projectTitle: data.projectTitle,
      description: data.description,
      features: data.features,
      referenceLinks: data.referenceLinks,
      designStyle: data.designStyle || "None specified",
      platform: platformString,
      startDate: data.startDate,
      deadline: data.deadline,
      budgetRange: data.budgetRange,
      hasAssets: data.hasAssets,
      additionalNotes: `Brand Assets Uploaded: ${data.hasAssets ? "Yes" : "No"}\nLogo: ${data.uploadedLogo || "None"}\nGuidelines: ${data.uploadedGuidelines || "None"}\nDocuments: ${data.uploadedDocuments || "None"}\nMedia: ${data.uploadedMedia || "None"}\n\nNotes: ${data.additionalNotes || "None"}`,
      agreement: data.agreement,
    };

    try {
      const response = await fetch("/api/project-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit project request.");
      }

      setIsSuccess(true);
      localStorage.removeItem("devdale_project_form");
      localStorage.removeItem("devdale_project_form_step");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  if (isSuccess) {
    return (
      <div className="project-form-page min-h-screen py-24 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="premium-form-card max-w-xl w-full p-12 rounded-[2rem] text-center border"
        >
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Check className="h-10 w-10 stroke-[3]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-black">
            Vision Received
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto mb-8">
            Your project blueprint is inside our engineering lab. A senior digital architect will analyze your scope and connect within 24 hours.
          </p>
          <Button 
            onClick={() => {
              setIsSuccess(false);
              setCurrentStep(1);
              setUploadedFiles({});
            }}
            className="bg-black hover:bg-neutral-800 text-white rounded-full py-6 px-8 text-md font-semibold transition-all hover:scale-[1.02]"
          >
            Launch Another Strategy
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="project-form-page min-h-screen py-20 px-4 md:px-8">
      <div className="form-content-container max-w-4xl mx-auto">
        
        {/* Centered Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-4">
            Start Your Project
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Fill out the form below to give us a clear understanding of your vision. We'll get back to you with a tailored proposal.
          </p>
        </div>

        {/* Thin progress bar across top */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-black">
              {STEPS[currentStep - 1].title}
            </span>
          </div>
          <div className="h-[2px] bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="premium-progress-bar h-full bg-black rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form Large Card Container */}
        <div className="premium-form-card max-w-2xl mx-auto rounded-[2rem] overflow-hidden p-8 md:p-12 border border-neutral-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-[300px] flex flex-col justify-between"
              >
                <div>
                  
                  {/* Step 1: Client Details */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
                        <User className="h-5 w-5 text-black" />
                        <h2 className="text-xl font-bold text-black tracking-tight">Who are we working with?</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-black">Full Name *</Label>
                          <Input 
                            id="fullName" 
                            placeholder="John Doe" 
                            {...register("fullName")}
                            className={cn("premium-input rounded-xl py-6 px-4", errors.fullName && "border-red-500 focus-visible:ring-red-100")}
                          />
                          {errors.fullName && <p className="text-red-500 text-xs font-medium mt-1">{(errors.fullName.message as string)}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyName" className="text-sm font-medium text-black">Company Name</Label>
                          <Input 
                            id="companyName" 
                            placeholder="Acme Inc." 
                            {...register("companyName")}
                            className="premium-input rounded-xl py-6 px-4"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-black">Email Address *</Label>
                          <Input 
                            id="email" 
                            type="email"
                            placeholder="john@example.com" 
                            {...register("email")}
                            className={cn("premium-input rounded-xl py-6 px-4", errors.email && "border-red-500 focus-visible:ring-red-100")}
                          />
                          {errors.email && <p className="text-red-500 text-xs font-medium mt-1">{(errors.email.message as string)}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-black">Phone / WhatsApp</Label>
                          <Input 
                            id="phone" 
                            placeholder="+1 (555) 000-0000" 
                            {...register("phone")}
                            className="premium-input rounded-xl py-6 px-4"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium text-black">Country</Label>
                        <Input 
                          id="country" 
                          placeholder="United States" 
                          {...register("country")}
                          className="premium-input rounded-xl py-6 px-4"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Project Overview */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
                        <Briefcase className="h-5 w-5 text-black" />
                        <h2 className="text-xl font-bold text-black tracking-tight">Tell us about the project</h2>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Project Type *</Label>
                        <Controller
                          name="projectType"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={cn("premium-select-trigger rounded-xl py-6 px-4 text-left border-neutral-200", errors.projectType && "border-red-500")}>
                                <SelectValue placeholder="Select project type" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border rounded-xl shadow-xl">
                                <SelectItem value="Website" className="focus:bg-neutral-100">Website</SelectItem>
                                <SelectItem value="Web App" className="focus:bg-neutral-100">Web App</SelectItem>
                                <SelectItem value="Mobile App" className="focus:bg-neutral-100">Mobile App</SelectItem>
                                <SelectItem value="SaaS Platform" className="focus:bg-neutral-100">SaaS Platform</SelectItem>
                                <SelectItem value="E-commerce" className="focus:bg-neutral-100">E-commerce</SelectItem>
                                <SelectItem value="Branding" className="focus:bg-neutral-100">Branding</SelectItem>
                                <SelectItem value="UI/UX Design" className="focus:bg-neutral-100">UI/UX Design</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.projectType && <p className="text-red-500 text-xs font-medium mt-1">{(errors.projectType.message as string)}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projectTitle" className="text-sm font-medium text-black">Project Title *</Label>
                        <Input 
                          id="projectTitle" 
                          placeholder="My Awesome Platform" 
                          {...register("projectTitle")}
                          className={cn("premium-input rounded-xl py-6 px-4", errors.projectTitle && "border-red-500")}
                        />
                        {errors.projectTitle && <p className="text-red-500 text-xs font-medium mt-1">{(errors.projectTitle.message as string)}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-black">Description *</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Briefly describe what you want to build…" 
                          {...register("description")}
                          className={cn("premium-textarea rounded-xl min-h-[140px] p-4 resize-none", errors.description && "border-red-500")}
                        />
                        {errors.description && <p className="text-red-500 text-xs font-medium mt-1">{(errors.description.message as string)}</p>}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Features Required */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
                        <FileText className="h-5 w-5 text-black" />
                        <h2 className="text-xl font-bold text-black tracking-tight">Key Features</h2>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Add features required for the project *</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="e.g. User Dashboard, Stripe Payment…" 
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addFeature();
                              }
                            }}
                            className={cn("premium-input rounded-xl py-6 px-4 flex-1", errors.features && "border-red-500")}
                          />
                          <Button 
                            type="button" 
                            onClick={addFeature}
                            className="bg-black hover:bg-neutral-800 text-white rounded-xl py-6 px-6 font-semibold transition-all"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </div>
                        {errors.features && <p className="text-red-500 text-xs font-medium mt-1">{(errors.features.message as string)}</p>}
                      </div>

                      {/* Feature tags grid */}
                      <div className="space-y-3 pt-2">
                        {features.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {features.map((feat: string, i: number) => (
                              <div 
                                key={i}
                                className="feature-tag flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-black border border-neutral-100"
                              >
                                <span>{feat}</span>
                                <button 
                                  type="button" 
                                  onClick={() => removeFeature(i)}
                                  className="text-neutral-400 hover:text-black transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                            <FileText className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                            <p className="text-neutral-400 text-sm">
                              No features added yet. Type above and click Add.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Design Preferences */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
                        <Palette className="h-5 w-5 text-black" />
                        <h2 className="text-xl font-bold text-black tracking-tight">Design & Style</h2>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Reference Links</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="https://example.com" 
                            value={refLinkInput}
                            onChange={(e) => {
                              setRefLinkInput(e.target.value);
                              setRefLinkError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addReferenceLink();
                              }
                            }}
                            className={cn("premium-input rounded-xl py-6 px-4 flex-1", refLinkError && "border-red-500")}
                          />
                          <Button 
                            type="button" 
                            onClick={addReferenceLink}
                            variant="outline"
                            className="border-neutral-200 hover:bg-neutral-50 rounded-xl py-6 px-6 font-semibold transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {refLinkError && <p className="text-red-500 text-xs font-medium mt-1">{refLinkError}</p>}
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                          {referenceLinks.map((link: string, i: number) => (
                            <div 
                              key={i}
                              className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-full text-xs text-neutral-600 border border-neutral-200/50"
                            >
                              <span className="truncate max-w-[200px]">{link}</span>
                              <button 
                                type="button" 
                                onClick={() => removeReferenceLink(i)}
                                className="text-neutral-400 hover:text-neutral-800 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="designStyle" className="text-sm font-medium text-black">Preferred Colors / Style</Label>
                        <Textarea 
                          id="designStyle" 
                          placeholder="Clean, minimalist, vibrant colors…" 
                          {...register("designStyle")}
                          className="premium-textarea rounded-xl min-h-[120px] p-4 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 5: Technical Requirements */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
                        <Cpu className="h-5 w-5 text-black" />
                        <h2 className="text-xl font-bold text-black tracking-tight">Technical Needs</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="existingWebsiteUrl" className="text-sm font-medium text-black">Existing Website URL</Label>
                          <Input 
                            id="existingWebsiteUrl" 
                            placeholder="https://yourwebsite.com" 
                            {...register("existingWebsiteUrl")}
                            className={cn("premium-input rounded-xl py-6 px-4", errors.existingWebsiteUrl && "border-red-500")}
                          />
                          {errors.existingWebsiteUrl && <p className="text-red-500 text-xs font-medium mt-1">{(errors.existingWebsiteUrl.message as string)}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="techStack" className="text-sm font-medium text-black">Preferred Tech Stack</Label>
                          <Input 
                            id="techStack" 
                            placeholder="React, Next.js, MERN…" 
                            {...register("techStack")}
                            className="premium-input rounded-xl py-6 px-4"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="custom-toggle-card flex items-center justify-between p-5 rounded-2xl border">
                          <div>
                            <Label htmlFor="needCms" className="text-sm font-bold text-black block mb-0.5 cursor-pointer">Need CMS?</Label>
                            <span className="text-xs text-neutral-400">Content Management System</span>
                          </div>
                          <Controller
                            name="needCms"
                            control={control}
                            render={({ field }) => (
                              <Switch 
                                id="needCms" 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                                className="data-[state=checked]:bg-black"
                              />
                            )}
                          />
                        </div>

                        <div className="custom-toggle-card flex items-center justify-between p-5 rounded-2xl border">
                          <div>
                            <Label htmlFor="needAdminDashboard" className="text-sm font-bold text-black block mb-0.5 cursor-pointer">Need Admin Dashboard?</Label>
                            <span className="text-xs text-neutral-400">Management & analytics panel</span>
                          </div>
                          <Controller
                            name="needAdminDashboard"
                            control={control}
                            render={({ field }) => (
                              <Switch 
                                id="needAdminDashboard" 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                                className="data-[state=checked]:bg-black"
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="integrations" className="text-sm font-medium text-black">Third-party integrations needed?</Label>
                        <Textarea 
                          id="integrations" 
                          placeholder="Stripe payments, Twilio SMS, HubSpot CRM, etc." 
                          {...register("integrations")}
                          className="premium-textarea rounded-xl min-h-[100px] p-4 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 6: Timeline & Budget */}
                  {currentStep === 6 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
                        <Calendar className="h-5 w-5 text-black" />
                        <h2 className="text-xl font-bold text-black tracking-tight">Timeline & Budget</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate" className="text-sm font-medium text-black">Desired Start Date *</Label>
                          <div className="date-input-wrapper">
                            <Input 
                              id="startDate" 
                              type="date"
                              {...register("startDate")}
                              className={cn("premium-input rounded-xl py-6 px-4 w-full relative", errors.startDate && "border-red-500")}
                            />
                            <Calendar className="date-input-icon h-4 w-4" />
                          </div>
                          {errors.startDate && <p className="text-red-500 text-xs font-medium mt-1">{(errors.startDate.message as string)}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deadline" className="text-sm font-medium text-black">Target Deadline *</Label>
                          <div className="date-input-wrapper">
                            <Input 
                              id="deadline" 
                              type="date"
                              {...register("deadline")}
                              className={cn("premium-input rounded-xl py-6 px-4 w-full relative", errors.deadline && "border-red-500")}
                            />
                            <Calendar className="date-input-icon h-4 w-4" />
                          </div>
                          {errors.deadline && <p className="text-red-500 text-xs font-medium mt-1">{(errors.deadline.message as string)}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Budget Range *</Label>
                        <Controller
                          name="budgetRange"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={cn("premium-select-trigger rounded-xl py-6 px-4 text-left border-neutral-200", errors.budgetRange && "border-red-500")}>
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border rounded-xl shadow-xl">
                                <SelectItem value="Under $1k" className="focus:bg-neutral-100">Under $1k</SelectItem>
                                <SelectItem value="$1k – $5k" className="focus:bg-neutral-100">$1k – $5k</SelectItem>
                                <SelectItem value="$5k – $10k" className="focus:bg-neutral-100">$5k – $10k</SelectItem>
                                <SelectItem value="$10k – $25k" className="focus:bg-neutral-100">$10k – $25k</SelectItem>
                                <SelectItem value="$25k+" className="focus:bg-neutral-100">$25k+</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.budgetRange && <p className="text-red-500 text-xs font-medium mt-1">{(errors.budgetRange.message as string)}</p>}
                      </div>
                    </div>
                  )}

                  {/* Step 7: Content & Assets */}
                  {currentStep === 7 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
                        <ImageIcon className="h-5 w-5 text-black" />
                        <h2 className="text-xl font-bold text-black tracking-tight">Content & Assets</h2>
                      </div>

                      <div className="custom-toggle-card flex items-center justify-between p-6 rounded-2xl border">
                        <div>
                          <Label htmlFor="hasAssets" className="text-base font-bold text-black block mb-0.5 cursor-pointer">
                            Do you have branding & content ready?
                          </Label>
                          <span className="text-xs text-neutral-400">Logo, copy, images, etc.</span>
                        </div>
                        <Controller
                          name="hasAssets"
                          control={control}
                          render={({ field }) => (
                            <Switch 
                              id="hasAssets" 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                              className="data-[state=checked]:bg-black"
                            />
                          )}
                        />
                      </div>

                      {/* Conditionally reveal drag and drop upload inputs */}
                      <AnimatePresence>
                        {hasAssets && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 overflow-hidden"
                          >
                            {[
                              { key: "logo", label: "Logo Upload", accept: "SVG, PNG, EPS" },
                              { key: "guidelines", label: "Brand Guidelines", accept: "PDF, DOCX" },
                              { key: "documents", label: "Content Documents", accept: "TXT, PDF, DOCX" },
                              { key: "media", label: "Images / Media", accept: "JPG, PNG, MP4" },
                            ].map((zone) => {
                              const isUploaded = !!uploadedFiles[zone.key];
                              return (
                                <div 
                                  key={zone.key}
                                  onClick={() => handleFakeUpload(zone.key, `demo_${zone.key}_asset.png`)}
                                  className="upload-dropzone rounded-2xl p-5 text-center cursor-pointer border flex flex-col justify-center min-h-[120px] relative group"
                                >
                                  {isUploaded ? (
                                    <div className="space-y-1">
                                      <FileUp className="h-6 w-6 text-black mx-auto" />
                                      <p className="text-xs font-bold text-black truncate max-w-[180px] mx-auto">
                                        {uploadedFiles[zone.key]}
                                      </p>
                                      <button 
                                        type="button"
                                        onClick={(e) => clearFakeUpload(zone.key, e)}
                                        className="text-neutral-400 hover:text-black absolute top-2 right-2 p-1"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <Upload className="h-5 w-5 text-neutral-400 mx-auto transition-transform group-hover:-translate-y-0.5" />
                                      <p className="text-xs font-bold text-black">{zone.label}</p>
                                      <p className="text-[10px] text-neutral-400">Click or drag ({zone.accept})</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Step 8: Additional Notes */}
                  {currentStep === 8 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
                        <MessageSquare className="h-5 w-5 text-black" />
                        <h2 className="text-xl font-bold text-black tracking-tight">Anything else?</h2>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="additionalNotes" className="text-sm font-medium text-black">Additional Notes</Label>
                        <Textarea 
                          id="additionalNotes" 
                          placeholder="Any specific concerns…" 
                          {...register("additionalNotes")}
                          className="premium-textarea rounded-2xl min-h-[180px] p-5 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 9: Final Confirmation */}
                  {currentStep === 9 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-2 border-b border-neutral-100">
                        <CheckCircle2 className="h-5 w-5 text-black" />
                        <h2 className="text-xl font-bold text-black tracking-tight">Final Confirmation</h2>
                      </div>

                      <div className="p-6 rounded-2xl border bg-neutral-50/50 flex items-start gap-4 cursor-pointer mt-4">
                        <Controller
                          name="agreement"
                          control={control}
                          render={({ field }) => (
                            <Checkbox 
                              id="agreement" 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              className="mt-1 border-neutral-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                            />
                          )}
                        />
                        <div className="grid gap-1 leading-relaxed">
                          <Label htmlFor="agreement" className="text-sm font-semibold text-black cursor-pointer leading-normal select-none">
                            I agree to the processing of my data for the purpose of this project request.
                          </Label>
                          <p className="text-xs text-neutral-400">
                            By checking this, you accept our standard design sprint consulting and terms of data.
                          </p>
                        </div>
                      </div>
                      {errors.agreement && <p className="text-red-500 text-xs font-semibold">{(errors.agreement.message as string)}</p>}
                    </div>
                  )}

                </div>

                {/* System / Submission Errors */}
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mt-6 flex items-center gap-2">
                    <X className="h-4 w-4 shrink-0 stroke-[2.5]" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-10 mt-8 border-t border-neutral-100/50">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevStep}
                    disabled={currentStep === 1 || isSubmitting}
                    className="border-neutral-200 hover:bg-neutral-50 rounded-full py-5 px-6 font-bold flex items-center gap-2 hover:scale-[1.01] transition-transform disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button 
                      type="button" 
                      onClick={handleNextStep}
                      className="bg-black hover:bg-neutral-800 text-white rounded-full py-5 px-6 font-bold flex items-center gap-2 hover:scale-[1.01] transition-transform"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !agreement}
                      className="bg-black hover:bg-neutral-800 text-white rounded-full py-5 px-8 font-bold flex items-center gap-2 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:opacity-80 transition-all hover:scale-[1.01]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>Submit Project Request 🚀</>
                      )}
                    </Button>
                  )}
                </div>

              </motion.div>
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}
