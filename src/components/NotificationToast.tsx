/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Award, ShoppingCart, Zap, Flame } from "lucide-react";

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "award" | "shop" | "streak" | "warning";
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2.5 w-full max-w-[320px] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          // Choose border and icon details depending on type
          let borderColor = "border-[#00FFCC]";
          let icon = <CheckCircle className="w-5 h-5 text-[#00FFCC]" />;
          
          if (toast.type === "award") {
            borderColor = "border-[#FF3366]";
            icon = <Award className="w-5 h-5 text-[#FF3366] animate-bounce" />;
          } else if (toast.type === "shop") {
            borderColor = "border-amber-400";
            icon = <ShoppingCart className="w-5 h-5 text-amber-400" />;
          } else if (toast.type === "streak") {
            borderColor = "border-orange-500";
            icon = <Flame className="w-5 h-5 text-orange-500 animate-pulse" />;
          } else if (toast.type === "warning") {
            borderColor = "border-red-500 bg-red-950/20";
            icon = <Zap className="w-5 h-5 text-red-500" />;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onAnimationComplete={() => {
                // Auto dismiss after 2.8 seconds
                setTimeout(() => {
                  removeToast(toast.id);
                }, 2800);
              }}
              className={`pointer-events-auto bg-[#0D0D0D]/95 border-2 ${borderColor} shadow-2xl rounded-2xl p-4 flex items-center space-x-3 w-full backdrop-blur-md`}
            >
              <div className="flex-shrink-0">{icon}</div>
              <div className="flex-1 text-xs font-sans font-bold text-white tracking-wide leading-relaxed">
                {toast.text}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-500 hover:text-white text-base font-bold select-none cursor-pointer duration-100 px-1"
              >
                &times;
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
