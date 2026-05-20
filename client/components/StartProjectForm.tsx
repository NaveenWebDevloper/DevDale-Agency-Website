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
  X
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { cn } from "../lib/utils";
import "./StartProjectForm.css";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().optional(),
  projectType: z.enum(["Website", "Web App", "E-commerce", "Other"]),
  projectTitle: z.string().min(5, "Project title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a more detailed description"),
  features: z.array(z.string()).min(1, "Please add at least one feature"),
  referenceLinks: z.array(z.string().url("Invalid URL")).default([]),
  designStyle: z.string().optional(),
  platform: z.enum(["Custom", "WordPress", "Shopify", "Not sure"]),
  integrations: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  deadline: z.string().min(1, "Deadline is required"),
  budgetRange: z.enum(["< $500", "$500–$2000", "$2000+"]),
  hasAssets: z.boolean().default(false),
  additionalNotes: z.string().optional(),
  agreement: z.boolean().refine((val) => val === true, "You must agree to the terms"),
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
  const [refLinkInput, setRefLinkInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<any>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      features: [],
      referenceLinks: [],
      hasAssets: false,
      agreement: false,
    },
  });

  // Load from local storage
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

  // Save to local storage
  const formData = watch();
  useEffect(() => {
    localStorage.setItem("devdale_project_form", JSON.stringify(formData));
    localStorage.setItem("devdale_project_form_step", currentStep.toString());
  }, [formData, currentStep]);

  const addFeature = () => {
    if (featureInput.trim()) {
      const currentFeatures = watch("features") || [];
      setValue("features", [...currentFeatures, featureInput.trim()]);
      setFeatureInput("");
      trigger("features");
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = watch("features") || [];
    setValue("features", currentFeatures.filter((_, i) => i !== index));
    trigger("features");
  };

  const addReferenceLink = () => {
    if (refLinkInput && /^https?:\/\/.+/.test(refLinkInput)) {
      const currentLinks = watch("referenceLinks") || [];
      setValue("referenceLinks", [...currentLinks, refLinkInput]);
      setRefLinkInput("");
    }
  };

  const removeReferenceLink = (index: number) => {
    const currentLinks = watch("referenceLinks") || [];
    setValue("referenceLinks", currentLinks.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate as any);
    
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ 
        top: document.getElementById("start-project-form")?.offsetTop ? document.getElementById("start-project-form")!.offsetTop - 100 : 0, 
        behavior: 'smooth' 
      });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1: return ["fullName", "email"];
      case 2: return ["projectType", "projectTitle", "description"];
      case 3: return ["features"];
      case 4: return ["referenceLinks"];
      case 5: return ["platform"];
      case 6: return ["startDate", "deadline", "budgetRange"];
      case 7: return ["hasAssets"];
      case 8: return ["additionalNotes"];
      case 9: return ["agreement"];
      default: return [];
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/project-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detailedError = errorData.error ? `${errorData.message} (Detail: ${errorData.error})` : (errorData.message || "Submission failed. Please try again.");
        throw new Error(detailedError);
      }

      setIsSuccess(true);
      localStorage.removeItem("devdale_project_form");
      localStorage.removeItem("devdale_project_form_step");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  if (isSuccess) {
    return (
      <section id="start-project-form" className="start-project-form-container">
        <div className="step-card success-message animate-slide-up">
          <CheckCircle2 className="success-icon" />
          <h2 className="text-3xl font-bold mb-4">Project Request Sent!</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Thanks! We've received your project details. Our team will review them and contact you within 24 hours.
          </p>
          <Button 
            className="mt-8" 
            onClick={() => {
              setIsSuccess(false);
              setCurrentStep(1);
            }}
          >
            Send Another Request
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="start-project-form" className="start-project-form-container py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold tracking-tight mb-4">Start Your Project</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Fill out the form below to give us a clear understanding of your vision. We'll get back to you with a tailored proposal.
        </p>
      </div>

      <div className="progress-container max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="step-indicator">Step {currentStep} of {STEPS.length}</span>
          <span className="text-sm font-bold text-primary">{STEPS[currentStep - 1].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="step-card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {/* Step 1: Client Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="text-primary h-6 w-6" />
                    <h3 className="text-xl font-bold">Who are we working with?</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="field-group">
                      <Label htmlFor="fullName" className="field-label">Full Name *</Label>
                      <Input 
                        id="fullName" 
                        placeholder="John Doe" 
                        {...register("fullName")}
                        className={errors.fullName ? "border-destructive" : ""}
                      />
                      {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
                    </div>
                    <div className="field-group">
                      <Label htmlFor="companyName" className="field-label">Company Name</Label>
                      <Input id="companyName" placeholder="Acme Inc." {...register("companyName")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="field-group">
                      <Label htmlFor="email" className="field-label">Email Address *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john@example.com" 
                        {...register("email")}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="error-message">{errors.email.message}</p>}
                    </div>
                    <div className="field-group">
                      <Label htmlFor="phone" className="field-label">Phone / WhatsApp</Label>
                      <Input id="phone" placeholder="+1 (555) 000-0000" {...register("phone")} />
                    </div>
                  </div>
                  <div className="field-group">
                    <Label htmlFor="country" className="field-label">Country</Label>
                    <Input id="country" placeholder="United States" {...register("country")} />
                  </div>
                </div>
              )}

              {/* Step 2: Project Overview */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Briefcase className="text-primary h-6 w-6" />
                    <h3 className="text-xl font-bold">Tell us about the project</h3>
                  </div>
                  <div className="field-group">
                    <Label className="field-label">Project Type *</Label>
                    <Controller
                      name="projectType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <SelectTrigger className={errors.projectType ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Web App">Web App</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.projectType && <p className="error-message">{errors.projectType.message}</p>}
                  </div>
                  <div className="field-group">
                    <Label htmlFor="projectTitle" className="field-label">Project Title *</Label>
                    <Input 
                      id="projectTitle" 
                      placeholder="My Awesome Platform" 
                      {...register("projectTitle")}
                      className={errors.projectTitle ? "border-destructive" : ""}
                    />
                    {errors.projectTitle && <p className="error-message">{errors.projectTitle.message}</p>}
                  </div>
                  <div className="field-group">
                    <Label htmlFor="description" className="field-label">Description *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Briefly describe what you want to build..." 
                      className={cn("min-h-[120px]", errors.description ? "border-destructive" : "")}
                      {...register("description")}
                    />
                    {errors.description && <p className="error-message">{errors.description.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Features Required */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="text-primary h-6 w-6" />
                    <h3 className="text-xl font-bold">Key Features</h3>
                  </div>
                  <div className="field-group">
                    <Label className="field-label">What features are essential? *</Label>
                    <div className="flex gap-2 mb-6">
                      <Input 
                        placeholder="e.g. User Dashboard, Stripe Payment..." 
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        className={errors.features ? "border-destructive" : ""}
                      />
                      <Button type="button" onClick={addFeature} className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" /> Add
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {watch("features")?.map((feature, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border group hover:border-primary/30 transition-colors"
                          >
                            <span className="font-medium">{feature}</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeFeature(i)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {watch("features")?.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                        <p className="text-muted-foreground">No features added yet. Type above and click Add.</p>
                      </div>
                    )}

                    {errors.features && <p className="error-message">{errors.features.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 4: Design Preferences */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="text-primary h-6 w-6" />
                    <h3 className="text-xl font-bold">Design & Style</h3>
                  </div>
                  <div className="field-group">
                    <Label className="field-label">Reference Links</Label>
                    <div className="flex gap-2 mb-4">
                      <Input 
                        placeholder="https://example.com" 
                        value={refLinkInput}
                        onChange={(e) => setRefLinkInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReferenceLink())}
                      />
                      <Button type="button" size="icon" variant="outline" onClick={addReferenceLink}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {watch("referenceLinks")?.map((link, i) => (
                        <div key={i} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-sm">
                          <span className="truncate max-w-[200px]">{link}</span>
                          <button type="button" onClick={() => removeReferenceLink(i)}>
                            <X className="h-3 w-3 hover:text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="field-group">
                    <Label htmlFor="designStyle" className="field-label">Preferred Colors / Style</Label>
                    <Textarea 
                      id="designStyle" 
                      placeholder="Clean, minimalist, vibrant colors..." 
                      {...register("designStyle")}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Technical Requirements */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Cpu className="text-primary h-6 w-6" />
                    <h3 className="text-xl font-bold">Technical Specs</h3>
                  </div>
                  <div className="field-group">
                    <Label className="field-label">Platform Choice *</Label>
                    <Controller
                      name="platform"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          value={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {["Custom", "WordPress", "Shopify", "Not sure"].map((plat) => {
                            const id = `platform-${plat.toLowerCase().replace(/\s+/g, "-")}`;
                            return (
                              <div 
                                key={plat} 
                                onClick={() => field.onChange(plat)}
                                className={cn(
                                  "flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                                  field.value === plat ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-input"
                                )}
                              >
                                <RadioGroupItem value={plat} id={id} />
                                <Label htmlFor={id} className="cursor-pointer flex-1 font-medium">{plat}</Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      )}
                    />
                    {errors.platform && <p className="error-message">{errors.platform.message}</p>}
                  </div>
                  <div className="field-group">
                    <Label htmlFor="integrations" className="field-label">Third-party Integrations</Label>
                    <Textarea 
                      id="integrations" 
                      placeholder="Stripe, Twilio, HubSpot..." 
                      {...register("integrations")}
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Timeline & Budget */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="text-primary h-6 w-6" />
                    <h3 className="text-xl font-bold">Timeline & Budget</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="field-group">
                      <Label htmlFor="startDate" className="field-label">Desired Start Date *</Label>
                      <Input id="startDate" type="date" {...register("startDate")} className={errors.startDate ? "border-destructive" : ""} />
                      {errors.startDate && <p className="error-message">{errors.startDate.message}</p>}
                    </div>
                    <div className="field-group">
                      <Label htmlFor="deadline" className="field-label">Target Deadline *</Label>
                      <Input id="deadline" type="date" {...register("deadline")} className={errors.deadline ? "border-destructive" : ""} />
                      {errors.deadline && <p className="error-message">{errors.deadline.message}</p>}
                    </div>
                  </div>
                  <div className="field-group">
                    <Label className="field-label">Budget Range *</Label>
                    <Controller
                      name="budgetRange"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <SelectTrigger className={errors.budgetRange ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="< $500">&lt; $500</SelectItem>
                            <SelectItem value="$500–$2000">$500 – $2,000</SelectItem>
                            <SelectItem value="$2000+">$2,000+</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.budgetRange && <p className="error-message">{errors.budgetRange.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 7: Content & Assets */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <ImageIcon className="text-primary h-6 w-6" />
                    <h3 className="text-xl font-bold">Content & Assets</h3>
                  </div>
                  <div className="field-group flex items-center justify-between p-6 border rounded-xl bg-accent/20">
                    <div>
                      <Label htmlFor="hasAssets" className="text-lg font-bold">Do you have branding & content ready?</Label>
                      <p className="text-sm text-muted-foreground mt-1">Logo, copy, images, etc.</p>
                    </div>
                    <Controller
                      name="hasAssets"
                      control={control}
                      render={({ field }) => (
                        <Switch id="hasAssets" checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 8: Additional Notes */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="text-primary h-6 w-6" />
                    <h3 className="text-xl font-bold">Anything else?</h3>
                  </div>
                  <div className="field-group">
                    <Label htmlFor="additionalNotes" className="field-label">Additional Notes</Label>
                    <Textarea 
                      id="additionalNotes" 
                      placeholder="Any specific concerns..." 
                      className="min-h-[200px]"
                      {...register("additionalNotes")}
                    />
                  </div>
                </div>
              )}

              {/* Step 9: Agreement */}
              {currentStep === 9 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="text-primary h-6 w-6" />
                    <h3 className="text-xl font-bold">Final Confirmation</h3>
                  </div>
                  <div className="field-group flex items-start gap-3 pt-6">
                    <Controller
                      name="agreement"
                      control={control}
                      render={({ field }) => (
                        <Checkbox id="agreement" checked={field.value} onCheckedChange={field.onChange} className={errors.agreement ? "border-destructive" : ""} />
                      )}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="agreement" className="text-sm font-medium cursor-pointer">
                        I agree to the processing of my data for the purpose of this project request.
                      </Label>
                      {errors.agreement && <p className="error-message">{errors.agreement.message}</p>}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg mb-6 flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="btn-group">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1 || isSubmitting} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep} className="gap-2" disabled={isSubmitting}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="gap-2" disabled={isSubmitting || !isValid}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <>Submit Project Request 🚀</>}
              </Button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
