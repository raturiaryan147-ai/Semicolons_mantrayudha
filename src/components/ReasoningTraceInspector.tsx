import React, { useState } from 'react';
import { LayeredReasoningTrace } from '../types/agentReasoning';
import { ChevronDown, ChevronUp, Cpu, Database, ShieldCheck, Wrench, Compass, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ReasoningTraceInspectorProps {
  trace: LayeredReasoningTrace;
}

export const ReasoningTraceInspector: React.FC<ReasoningTraceInspectorProps> = ({ trace }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'ACT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ANSWER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ASK':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ESCALATE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="mt-2.5 rounded-xl border border-stone-200 bg-stone-50/90 text-left text-xs overflow-hidden">
      {/* Collapsed Bar / Summary Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between bg-stone-100/80 hover:bg-stone-200/80 transition-colors cursor-pointer text-[11px] font-semibold text-stone-700"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#FF5B26]" />
          <span className="font-bold text-stone-900">Layered Reasoning Trace</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getDecisionBadge(trace.decisionLayer.decision)}`}>
            {trace.decisionLayer.decision}
          </span>
          {trace.intentLayer.isMultiIntent && (
            <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
              Multi-Intent
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-stone-500">
          <span className="text-[10px]">
            {isExpanded ? 'Hide Trace' : 'Inspect 5 Layers'}
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded 5-Layer Details */}
      {isExpanded && (
        <div className="p-3.5 space-y-3.5 text-[11px] border-t border-stone-200 bg-white">
          
          {/* 1. INTENT LAYER */}
          <div className="space-y-1 pb-2 border-b border-stone-100">
            <div className="flex items-center justify-between text-stone-800 font-bold">
              <span className="flex items-center gap-1.5 text-[#0B3B2C]">
                <Compass className="w-3.5 h-3.5 text-[#FF5B26]" />
                1. Intent Layer (Parsed What Customer Wants)
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {trace.intentLayer.intents.length} Intent{trace.intentLayer.intents.length > 1 ? 's' : ''} detected
              </span>
            </div>
            
            <div className="space-y-1.5 pt-1">
              {trace.intentLayer.intents.map((intent, idx) => (
                <div key={idx} className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 font-mono text-[10px] bg-stone-200 px-1.5 py-0.5 rounded">
                      {intent.type}
                    </span>
                    <span className="text-stone-400 text-[10px] font-mono">
                      Conf: {Math.round(intent.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-stone-600 mt-1">{intent.summary}</p>
                  
                  {Object.keys(intent.extractedEntities).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                      {Object.entries(intent.extractedEntities).map(([key, val]) => (
                        val ? (
                          <span key={key} className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                            {key}: {String(val)}
                          </span>
                        ) : null
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. MEMORY LAYER */}
          <div className="space-y-1 pb-2 border-b border-stone-100">
            <div className="flex items-center justify-between text-stone-800 font-bold">
              <span className="flex items-center gap-1.5 text-[#0B3B2C]">
                <Database className="w-3.5 h-3.5 text-[#FF5B26]" />
                2. Memory Layer (Retrieved Prior Context)
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">Never re-asks known facts</span>
            </div>

            <div className="space-y-1 pt-1 text-stone-600">
              {trace.memoryLayer.reusedFacts.map((fact, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-stone-800 font-medium">
                  <span className="text-[#FF5B26]">▸</span>
                  <span>{fact}</span>
                </div>
              ))}

              {trace.memoryLayer.avoidedRepetitions.map((avoided, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-emerald-800 bg-emerald-50/60 p-1.5 rounded text-[10px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Avoided repetition: {avoided}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. POLICY LAYER */}
          <div className="space-y-1 pb-2 border-b border-stone-100">
            <div className="flex items-center justify-between text-stone-800 font-bold">
              <span className="flex items-center gap-1.5 text-[#0B3B2C]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF5B26]" />
                3. Policy Layer (Verified Rules & SLA)
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {trace.policyLayer.policyVersion}
              </span>
            </div>

            <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">{trace.policyLayer.ruleApplied}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                  trace.policyLayer.isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {trace.policyLayer.isEligible ? 'Policy Eligible' : 'Policy Blocked / Inapplicable'}
                </span>
              </div>
              <p className="text-stone-600">{trace.policyLayer.reason}</p>
              {trace.policyLayer.deadlineDate && (
                <p className="text-emerald-700 font-semibold">{trace.policyLayer.deadlineDate}</p>
              )}
            </div>
          </div>

          {/* 4. TOOLS LAYER */}
          <div className="space-y-1 pb-2 border-b border-stone-100">
            <div className="flex items-center justify-between text-stone-800 font-bold">
              <span className="flex items-center gap-1.5 text-[#0B3B2C]">
                <Wrench className="w-3.5 h-3.5 text-[#FF5B26]" />
                4. Tools Layer (Verified Tool Calls Only)
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {trace.toolsLayer.toolsCalled.length} Tool Executed
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {trace.toolsLayer.toolsCalled.map((tool, idx) => (
                <div key={idx} className="p-2 bg-stone-50 rounded-lg border border-stone-200/70 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-stone-900 font-bold">
                    <span>{tool.toolName}()</span>
                    <span className="text-emerald-700 uppercase">{tool.executionStatus}</span>
                  </div>
                  <div className="text-stone-500 mt-0.5 truncate">
                    Params: {JSON.stringify(tool.parameters)}
                  </div>
                  <p className="text-stone-700 font-sans mt-1 text-[11px]">{tool.resultSummary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. DECISION LAYER */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-stone-800 font-bold">
              <span className="flex items-center gap-1.5 text-[#0B3B2C]">
                <ArrowRight className="w-3.5 h-3.5 text-[#FF5B26]" />
                5. Decision Layer (Explicit Action Chosen)
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-600">
                Confidence: {Math.round(trace.decisionLayer.confidence * 100)}%
              </span>
            </div>

            <div className="p-2.5 bg-[#FFF8F3] rounded-lg border border-orange-200/80 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-stone-700 font-bold">Chosen Outcome:</span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getDecisionBadge(trace.decisionLayer.decision)}`}>
                  {trace.decisionLayer.decision}
                </span>
              </div>
              <p className="text-stone-700">
                <span className="font-semibold text-stone-900">Rationale:</span> {trace.decisionLayer.rationale}
              </p>
              <p className="text-[#0B3B2C] font-semibold">
                <span className="font-bold">Next Action:</span> {trace.decisionLayer.nextStep}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
