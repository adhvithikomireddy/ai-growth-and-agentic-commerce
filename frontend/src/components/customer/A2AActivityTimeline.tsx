import React, { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, Cpu, ArrowRightLeft, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { A2AActivityEvent } from "../../types/index.js";
import { Card } from "../ui/Card.js";
import { Badge } from "../ui/Badge.js";

interface A2AActivityTimelineProps {
  events: A2AActivityEvent[];
  isLoading?: boolean;
}

export const A2AActivityTimeline: React.FC<A2AActivityTimelineProps> = ({ events, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (events.length === 0 && !isLoading) return null;

  return (
    <Card className="w-full max-w-4xl mx-auto my-4 overflow-hidden border border-[#BBF7D0] bg-[#F0FDF4]/50">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-5 py-3 bg-[#DCFCE7]/70 cursor-pointer select-none hover:bg-[#DCFCE7] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#166534] text-white flex items-center justify-center">
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
            Agent-to-Agent (A2A) Operational Pipeline
          </span>
          <Badge variant="success" size="sm">
            {events.length} Milestones
          </Badge>
          {isLoading && (
            <span className="inline-flex items-center gap-1 text-xs text-[#166534] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#166534] animate-ping" />
              Active
            </span>
          )}
        </div>

        <button className="text-[#166534] p-1">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {events.map((evt, idx) => {
            const isLast = idx === events.length - 1;
            return (
              <div key={evt.id || idx} className="flex items-start gap-3 text-xs">
                <div className="mt-0.5 flex-shrink-0">
                  {evt.status === "verified" ? (
                    <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                  ) : evt.agent === "Policy Engine" ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Cpu className="w-4 h-4 text-[#166534]" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#172018]">{evt.agent}</span>
                    <span className="text-[10px] text-[#667067] font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-white border border-[#E2E8F0] font-mono text-[#475548]">
                      {evt.action}
                    </span>
                  </div>
                  <p className="text-[#475548] mt-0.5 leading-relaxed">{evt.description}</p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-[#667067] italic animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-[#166534] border-t-transparent animate-spin" />
              <span>Buyer Agent communicating with Merchant Agent over structured A2A layer...</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
