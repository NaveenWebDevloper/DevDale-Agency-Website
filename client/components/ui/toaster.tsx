import { useToast } from "../../hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../../components/ui/toast";
import { Check, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = props.variant || "default";

        // Generate matching Semantic Icon and colorful circular backgrounds matching the design inspiration
        let icon = (
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm border border-blue-100/50">
            <Info className="w-5 h-5 text-blue-600 stroke-[2.5]" />
          </div>
        );

        if (variant === "success") {
          icon = (
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-500 shadow-sm border border-emerald-100/50">
              <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
            </div>
          );
        } else if (variant === "destructive") {
          icon = (
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 text-rose-600 shadow-sm border border-rose-100/50">
              <AlertCircle className="w-5 h-5 text-rose-600 stroke-[2.5]" />
            </div>
          );
        }

        return (
          <Toast key={id} {...props} className="flex gap-4 items-start relative select-none">
            {icon}
            <div className="flex-1 flex flex-col gap-1 pr-4 pt-0.5">
              {title && (
                <ToastTitle className="text-slate-900 font-bold text-sm tracking-tight leading-none">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-slate-500 font-medium text-[13px] leading-normal mt-0.5">
                  {description}
                </ToastDescription>
              )}
              
              {/* Inspiration Link/Action text at the bottom */}
              {variant === "success" && (
                <span className="text-emerald-600 hover:text-emerald-700 font-bold text-[11px] tracking-wider uppercase mt-1 cursor-pointer transition-colors block w-fit">
                  Mission Control Confirmed
                </span>
              )}
              {variant === "destructive" && (
                <span className="text-rose-600 hover:text-rose-700 font-bold text-[11px] tracking-wider uppercase mt-1 cursor-pointer transition-colors block w-fit">
                  Try Again
                </span>
              )}
              {variant === "default" && (
                <span className="text-blue-600 hover:text-blue-700 font-bold text-[11px] tracking-wider uppercase mt-1 cursor-pointer transition-colors block w-fit">
                  Learn More
                </span>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
