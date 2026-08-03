"use client";

import { useTranslations } from "next-intl";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ConversationStep,
  getPhaseTopics,
  getSubTopic,
  getTopicSubTopics,
  GuideContent,
  Phase,
  phases,
  SubTopic,
  TicketData,
  TroubleshootStep,
} from "@/components/support/support-data";

interface SupportFlowProps {
  onOpenLiveChat: () => void;
}

export function SupportFlow({ onOpenLiveChat }: SupportFlowProps) {
  const t = useTranslations("Support");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentStep, setCurrentStep] = useState<ConversationStep | null>(null);
  const [history, setHistory] = useState<ConversationStep[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<Phase>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<TicketData>({
    email: "",
    subject: "",
    description: "",
    priority: "medium",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [troubleshootState, setTroubleshootState] = useState<Record<string, string>>({});

  // ─── Navigation ─────────────────────────────────────────────────

  const goToWelcome = () => {
    setCurrentStep({ id: "welcome", type: "welcome", data: {} });
    setHistory([]);
    setSelectedPhase(null);
    setSelectedTopic(null);
    setSelectedSubTopic(null);
    setTroubleshootState({});
  };

  const goToPhaseSelect = () => {
    setCurrentStep({ id: "phase-select", type: "phase-select", data: {} });
    setHistory((prev) => [...prev, currentStep!]);
    setSelectedPhase(null);
    setSelectedTopic(null);
    setSelectedSubTopic(null);
  };

  const goToTopicSelect = (phase: Phase) => {
    setSelectedPhase(phase);
    setCurrentStep({
      id: "topic-select",
      type: "topic-select",
      data: { phase },
    });
    setHistory((prev) => [...prev, currentStep!]);
    setSelectedTopic(null);
    setSelectedSubTopic(null);
  };

  const goToSubTopicSelect = (phase: Phase, topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentStep({
      id: "sub-topic",
      type: "sub-topic",
      data: { phase, topicId },
    });
    setHistory((prev) => [...prev, currentStep!]);
    setSelectedSubTopic(null);
  };

  const goToSolution = (phase: Phase, topicId: string, subTopicId: string) => {
    setSelectedSubTopic(subTopicId);
    const subTopic = getSubTopic(phase, topicId, subTopicId);
    setCurrentStep({
      id: "solution",
      type: "solution",
      data: { phase, topicId, subTopicId, subTopic },
    });
    setHistory((prev) => [...prev, currentStep!]);
  };

  const goToTicket = (phase: Phase, topicId: string, subTopicId: string) => {
    const subTopic = getSubTopic(phase, topicId, subTopicId);
    setCurrentStep({
      id: "ticket",
      type: "ticket",
      data: { phase, topicId, subTopicId, subTopic },
    });
    setHistory((prev) => [...prev, currentStep!]);
  };

  const goToConfirmation = (data: TicketData) => {
    setCurrentStep({
      id: "confirmation",
      type: "confirmation",
      data: { ticketData: data },
    });
    setHistory((prev) => [...prev, currentStep!]);
  };

  const goBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentStep(previous);
    }
  };

  // ─── Render: Welcome ───────────────────────────────────────────

  const renderWelcome = () => (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <ShieldCheck className="h-12 w-12 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">{t("howCanWeHelpYou")}</h1>
            <p className="text-sm text-zinc-400">{t("selectTheAreaYouNeed")}</p>
          </div>
        </div>
      </div>

      {/* Liquid grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {Object.entries(phases).map(([key, phase]) => (
          <button
            key={key}
            onClick={() => goToTopicSelect(key as Phase)}
            className={`p-4 rounded-xl border bg-zinc-950/40 hover:border-${phase.color}-500/30 transition-all text-center group`}
          >
            <div className="flex justify-center mb-2">
              <div className={`p-2 rounded-full bg-${phase.color}-500/10 border border-${phase.color}-500/20 group-hover:scale-110 transition-transform`}>
                {phase.icon}
              </div>
            </div>
            <p className="text-xs font-bold text-white">{phase.label}</p>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("placeholder_searchForHelpTopics")}
          className="h-12 pl-11 rounded-xl bg-zinc-950/40 border-white/10 text-white placeholder:text-zinc-500"
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3 text-center text-xs text-zinc-500">
        <div>
          <p className="font-bold text-white">📋 24/7</p>
          <p>{t("supportAvailable")}</p>
        </div>
        <div>
          <p className="font-bold text-white">{t("24Hrs")}</p>
          <p>{t("avgResponseTime")}</p>
        </div>
        <div>
          <p className="font-bold text-white">🎯 98%</p>
          <p>{t("satisfactionRate")}</p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        <button
          onClick={onOpenLiveChat}
          className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <MessageCircle className="h-4 w-4" /> {t("liveChat")}
        </button>
        <button
          onClick={() => (window.location.href = "mailto:support@nu-vora.app")}
          className="bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Mail className="h-4 w-4" /> {t("emailSupport")}
        </button>
      </div>
    </div>
  );

  // ─── Render: Phase Select ──────────────────────────────────────

  const renderPhaseSelect = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </button>
        <h2 className="text-lg font-bold text-white">{t("selectYourArea")}</h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
        {Object.entries(phases).map(([key, phase]) => (
          <button
            key={key}
            onClick={() => goToTopicSelect(key as Phase)}
            className={`p-4 rounded-xl border bg-zinc-950/40 hover:border-${phase.color}-500/30 transition-all text-left group`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-${phase.color}-500/10 border border-${phase.color}-500/20 group-hover:scale-110 transition-transform shrink-0`}>
                {phase.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{phase.label}</p>
                <p className="text-xs text-zinc-500">{t("clickToExplore")}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Render: Topic Select ──────────────────────────────────────

  const renderTopicSelect = (phase: Phase) => {
    const topics = getPhaseTopics(phase);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-zinc-400" />
          </button>
          <h2 className="text-lg font-bold text-white">{phases[phase!].label}</h2>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => goToSubTopicSelect(phase, topic.id)}
              className="p-4 rounded-xl border border-white/5 bg-zinc-950/30 hover:border-white/15 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg shrink-0">{topic.icon}</span>
                <span className="text-sm font-bold text-white">{topic.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ─── Render: Sub-Topic Select ──────────────────────────────────

  const renderSubTopicSelect = (phase: Phase, topicId: string) => {
    const subTopics = getTopicSubTopics(phase, topicId);
    const topic = getPhaseTopics(phase).find((t) => t.id === topicId);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-zinc-400" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white">{topic?.label}</h2>
            <p className="text-xs text-zinc-500">{t("whatsYourSpecificIssue")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {subTopics.map((subTopic) => (
            <button
              key={subTopic.id}
              onClick={() => goToSolution(phase, topicId, subTopic.id)}
              className="p-3 rounded-xl border border-white/5 bg-zinc-950/30 hover:border-white/15 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-300">{subTopic.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ─── Render: Solution ──────────────────────────────────────────

  const renderSolution = (
    phase: Phase,
    topicId: string,
    subTopicId: string,
    subTopic: SubTopic
  ) => {
    const { solutionType, guideContent, troubleshootSteps, escalationReason } = subTopic;

    if (solutionType === "guide" && guideContent) return renderGuide(guideContent);
    if (solutionType === "troubleshoot" && troubleshootSteps) {
      return renderTroubleshoot(phase, topicId, subTopicId, troubleshootSteps, subTopic);
    }
    if (solutionType === "escalation") {
      return renderEscalation(phase, topicId, subTopicId, escalationReason || "");
    }
    return null;
  };

  const renderGuide = (content: GuideContent) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-white">{t("guide")}</h2>
          <p className="text-xs text-zinc-500">{t("stepbystepInstructions")}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/30">
        <h3 className="text-base font-bold text-white mb-3">{content.title}</h3>
        <div className="space-y-2">
          {content.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 text-sm text-zinc-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>
        {content.tips && content.tips.length > 0 && (
          <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
            <p className="text-xs font-bold text-emerald-400">{t("Tips")}</p>
            {content.tips.map((tip, index) => (
              <p key={index} className="text-xs text-zinc-400">{tip}</p>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        <button
          onClick={onOpenLiveChat}
          className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <MessageCircle className="h-4 w-4" /> {t("chatWithSupport")}
        </button>
        <button
          onClick={() => (window.location.href = "mailto:support@nu-vora.app")}
          className="bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Mail className="h-4 w-4" /> {t("emailSupport")}
        </button>
      </div>
    </div>
  );

  const renderTroubleshoot = (
    phase: Phase,
    topicId: string,
    subTopicId: string,
    steps: TroubleshootStep[],
    subTopic: SubTopic
  ) => {
    const currentStepIndex = Object.keys(troubleshootState).length;
    const currentStep = steps[currentStepIndex];
    const isComplete = !currentStep || currentStepIndex >= steps.length;

    const handleOptionSelect = (value: string) => {
      setTroubleshootState((prev) => ({
        ...prev,
        [`step${currentStepIndex}`]: value,
      }));
    };

    if (isComplete) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-zinc-400" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white">{t("troubleshooting")}</h2>
              <p className="text-xs text-zinc-500">{t("issueResolved")}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white text-center">{t("troubleshootingComplete")}</h3>
            {subTopic.finalMessage && (
              <p className="text-sm text-zinc-400 text-center mt-2">{subTopic.finalMessage}</p>
            )}
            <p className="text-xs text-zinc-500 text-center mt-4">{t("ifYoureStillExperiencingIssues")}</p>
          </div>

          <button
            onClick={() => goToTicket(phase, topicId, subTopicId)}
            className="w-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <AlertCircle className="h-4 w-4" /> {t("stillHavingIssues")}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-zinc-400" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white">{t("troubleshooting")}</h2>
            <p className="text-xs text-zinc-500">
              {t("step")} {currentStepIndex + 1} {t("of")} {steps.length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/30">
          <p className="text-sm font-medium text-white mb-3">{currentStep.question}</p>
          <div className="space-y-2">
            {currentStep.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className="w-full p-3 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all text-left text-sm text-zinc-300 hover:text-white"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => goToTicket(phase, topicId, subTopicId)}
          className="w-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <AlertCircle className="h-4 w-4" /> {t("reportIssue")}
        </button>
      </div>
    );
  };

  const renderEscalation = (
    phase: Phase,
    topicId: string,
    subTopicId: string,
    reason: string
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-white">{t("criticalIssue")}</h2>
          <p className="text-xs text-zinc-500">{t("immediateAttentionRequired")}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white text-center">{t("ThisRequiresImmediateAttention")}</h3>
        <p className="text-sm text-zinc-400 text-center mt-2">{reason}</p>
        <p className="text-xs text-zinc-500 text-center mt-4">{t("ourSupportTeamWillPrioritize")}</p>
      </div>

      <button
        onClick={() => goToTicket(phase, topicId, subTopicId)}
        className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-white rounded-xl p-4 text-sm font-bold flex items-center justify-center gap-3 transition-all"
      >
        <FileText className="h-5 w-5" /> {t("createSupportTicket")}
      </button>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        <button
          onClick={() => (window.location.href = "mailto:support@nu-vora.app")}
          className="bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Mail className="h-4 w-4" /> {t("emailSupport")}
        </button>
        <button
          onClick={() => (window.location.href = "/support")}
          className="bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <BookOpen className="h-4 w-4" /> {t("knowledgeBase")}
        </button>
      </div>
    </div>
  );

  // ─── Render: Ticket ────────────────────────────────────────────

  const renderTicket = (phase: Phase, topicId: string, subTopicId: string) => {
    const subTopic = getSubTopic(phase, topicId, subTopicId);
    const phaseLabel = phase ? phases[phase]?.label : "General";

    const handleSubmit = () => {
      setIsSubmitting(true);
      // TODO: replace with real ticket insert when ready
      setTimeout(() => {
        setIsSubmitting(false);
        goToConfirmation(ticketData);
      }, 1500);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-zinc-400" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white">{t("createSupportTicket")}</h2>
            <p className="text-xs text-zinc-500">{t("wellGetBackToYou")}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/30 space-y-4">
          <div className="text-xs text-zinc-500 space-y-1">
            <p><span className="text-white">{t("category")}</span> {phaseLabel}</p>
            <p><span className="text-white">{t("issue")}</span> {subTopic?.label}</p>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 mb-1.5 block">{t("emailAddress")}</label>
            <Input
              type="email"
              value={ticketData.email}
              onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
              placeholder="your@email.app"
              className="bg-black border-white/10 text-white rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 mb-1.5 block">{t("subject")}</label>
            <Input
              value={ticketData.subject}
              onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
              placeholder={t("placeholder_briefDescriptionOfYourIssue")}
              className="bg-black border-white/10 text-white rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 mb-1.5 block">{t("description")}</label>
            <Textarea
              value={ticketData.description}
              onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
              placeholder={t("placeholder_pleaseProvideDetailsAboutYour")}
              rows={4}
              className="bg-black border-white/10 text-white rounded-xl resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 mb-1.5 block">{t("priority")}</label>
            <div className="flex flex-wrap gap-2">
              {["low", "medium", "high"].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setTicketData({ ...ticketData, priority: priority as any })}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    ticketData.priority === priority
                      ? priority === "high"
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : priority === "medium"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 text-zinc-500 hover:border-white/20"
                  }`}
                >
                  {priority.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 mb-1.5 block">{t("screenshotsOptional")}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setTicketData({ ...ticketData, attachment: e.target.files[0] });
                }
              }}
              className="text-xs text-zinc-400 bg-black border border-white/10 rounded-xl p-2 w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/5 file:text-white hover:file:bg-white/10"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!ticketData.email || !ticketData.subject || !ticketData.description || isSubmitting}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-12 text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Submit Ticket</>}
        </button>
      </div>
    );
  };

  // ─── Render: Confirmation ──────────────────────────────────────

  const renderConfirmation = (data: { ticketData: TicketData }) => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{t("ticketSubmitted")}</h2>
        <p className="text-sm text-zinc-400 mt-2">{t("yourSupportTicketHasBeen")}</p>
        <p className="text-xs text-zinc-500 mt-1">{t("wellRespondWithin24Hours")}</p>
      </div>

      <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/30 space-y-1">
        <p className="text-xs text-zinc-500">
          <span className="text-white">{t("reference")}</span> #{Date.now().toString().slice(-6)}
        </p>
        <p className="text-xs text-zinc-500">
          <span className="text-white">{t("email")}</span> {data.ticketData.email}
        </p>
        <p className="text-xs text-zinc-500">
          <span className="text-white">{t("priority_1")}</span> {data.ticketData.priority.toUpperCase()}
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-xl p-3 text-xs font-bold transition-all"
        >
          {t("returnHome")}
        </button>
        <button
          onClick={() => (window.location.href = "/support")}
          className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-white rounded-xl p-3 text-xs font-bold transition-all"
        >
          {t("backToSupport")}
        </button>
      </div>
    </div>
  );

  // ─── Main Render ───────────────────────────────────────────────

  return (
    <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-6 shadow-2xl">
      {!currentStep ? (
        renderWelcome()
      ) : (
        <>
          {currentStep.type === "welcome" && renderWelcome()}
          {currentStep.type === "phase-select" && renderPhaseSelect()}
          {currentStep.type === "topic-select" && renderTopicSelect(currentStep.data.phase)}
          {currentStep.type === "sub-topic" && renderSubTopicSelect(currentStep.data.phase, currentStep.data.topicId)}
          {currentStep.type === "solution" &&
            renderSolution(
              currentStep.data.phase,
              currentStep.data.topicId,
              currentStep.data.subTopicId,
              currentStep.data.subTopic
            )}
          {currentStep.type === "ticket" &&
            renderTicket(currentStep.data.phase, currentStep.data.topicId, currentStep.data.subTopicId)}
          {currentStep.type === "confirmation" && renderConfirmation(currentStep.data)}
        </>
      )}

      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <p className="text-[10px] text-zinc-600">
          {t("needImmediateHelp")}{" "}
          <button onClick={onOpenLiveChat} className="text-emerald-400 hover:underline">
            {t("liveChat")}
          </button>{" "}
          {t("available247")}
          <br />
          {t("orEmailUsAt")}{" "}
          <a href="mailto:support@nu-vora.app" className="text-emerald-400 hover:underline">
            support@nu-vora.app
          </a>
        </p>
      </div>
    </div>
  );
}