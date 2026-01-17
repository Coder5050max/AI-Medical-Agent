// my-app/app/dashboard/medical-agent/[sessionID]/page.tsx
"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button"; // Adjusted for my-app/app/_components/ui/button.tsx
import { PhoneCall, PhoneOff, Circle, Mic, Volume2, XCircle } from "lucide-react";

import { type DoctorAgent } from "@/config/schema"; // Adjusted for my-app/config/schema.ts
import { AIDoctorAgents } from "@/shared/list";

type SessionDetail = {
  SelectedDoctor: DoctorAgent;
  notes: string;
  sessionID: string;
  createdOn: string;
  voiceId: string;
  agentPrompt: string;
  conversation?: any;
  report?: any;
  createdBy: string;
};

type ConversationMessage = {
  id: string;
  speaker: "assistant" | "user";
  text: string;
  timestamp: string;
};

function MedicalVoiceAgent() {
  const { sessionID } = useParams();
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<"none" | "user" | "assistant">("none");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const getSessionDetail = useCallback(async () => {
    if (!sessionID) {
      console.error("No session ID found in URL parameters.");
      setError("No session ID found in URL. Please go back and start a new consultation.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log("Frontend: Fetching session for sessionID:", sessionID);
      const res = await axios.get(`/api/users/session-chat?sessionID=${sessionID}`);
      setSessionDetail(res.data);
      console.log("Frontend: Fetched Session Details:", res.data);
    } catch (err: any) {
      console.error("Frontend: Failed to fetch session:", err);
      if (err.response && err.response.status === 404) {
        setError(`Session with ID "${sessionID}" not found. It might have expired or never existed. Please check your API route for session-chat GET.`);
      } else {
        setError(`Failed to load session details: ${err.response?.data?.error || err.message}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  }, [sessionID]);

  useEffect(() => {
    getSessionDetail();
  }, [getSessionDetail]);

  useEffect(() => {
    if (callStarted) {
      intervalRef.current = setInterval(() => {
        setCallDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCallDuration(0);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callStarted]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!vapiInstance) {
      if (!process.env.NEXT_PUBLIC_VAPI_API_KEY) {
        console.error("VAPI_API_KEY not defined in environment variables.");
        setError("Vapi API Key is missing. Please check your environment configuration.");
        return;
      }
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY as string);
      setVapiInstance(vapi);
    }

    if (vapiInstance) {
      const handleCallStart = () => {
        setCallStarted(true);
        console.log("Vapi: Call Started");
        setMessages([]);
        setCallDuration(0);
        setCurrentSpeaker("none");
      };

      const handleCallEnd = () => {
        console.log("Vapi: Call Ended");
        setCallStarted(false);
        setCurrentSpeaker("none");
      };

      interface SpeechStartArgs {
        speaker: "user" | "assistant";
      }
      const handleSpeechStart = (args: SpeechStartArgs | undefined) => {
        if (!args || !args.speaker) {
          console.warn("SpeechStart event received without a valid speaker:", args);
          setCurrentSpeaker("none");
          return;
        }
        setCurrentSpeaker(args.speaker);
        console.log("Vapi: Speech Start:", args.speaker);
      };

      const handleSpeechEnd = () => {
        setCurrentSpeaker("none");
        console.log("Vapi: Speech End");
      };

      const handleMessage = (message: any) => {
        console.log("Vapi Message:", message);
        if (message.type === "transcript") {
          const speaker = message.role as "assistant" | "user";
          const text = message.transcript;
          const transcriptType = message.transcriptType;

          if (text.trim()) {
            setMessages((prevMessages) => {
              const lastMessage = prevMessages[prevMessages.length - 1];
              if (lastMessage && lastMessage.speaker === speaker && transcriptType === "partial") {
                return prevMessages.map((msg, idx) =>
                  idx === prevMessages.length - 1 ? { ...msg, text } : msg
                );
              } else {
                return [
                  ...prevMessages,
                  {
                    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                    speaker,
                    text,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ];
              }
            });
            setCurrentSpeaker(speaker);
          }
        }
      };

      const handleVapiError = (e: any) => {
        console.error("Vapi Error:", e);
        setCallStarted(false);
        setCurrentSpeaker("none");
        setError(`Vapi call error: ${e.error?.message || e.message || "An unknown error occurred."}`);
        if (e.error?.message?.includes("assistant.voice.voiceId must be a string") || e.error?.message?.includes("assistant.property VapiAgentConfig should not exist")) {
             setError(prev => `${prev} Please ensure the doctor's voice ID and agent prompt are correctly configured and retrieved from the database.`);
        }
      };

      vapiInstance.on("call-start", handleCallStart);
      vapiInstance.on("call-end", handleCallEnd);
      vapiInstance.on("speech-start", (args?: SpeechStartArgs) => handleSpeechStart(args));
      vapiInstance.on("speech-end", handleSpeechEnd);
      vapiInstance.on("message", handleMessage);
      vapiInstance.on("error", handleVapiError);

      return () => {
        vapiInstance.off("call-start", handleCallStart);
        vapiInstance.off("call-end", handleCallEnd);
        vapiInstance.off("speech-start", (args?: SpeechStartArgs) => handleSpeechStart(args));
        vapiInstance.off("speech-end", handleSpeechEnd);
        vapiInstance.off("message", handleMessage);
        vapiInstance.off("error", handleVapiError);
      };
    }
  }, [vapiInstance]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const StartCall = async () => {
    if (!vapiInstance) {
      console.error("Vapi instance not initialized.");
      setError("Vapi is not ready. Please refresh the page.");
      return;
    }
    if (!sessionDetail) {
      console.error("Session details not loaded yet. Cannot start call.");
      setError("Session details not loaded. Cannot start call.");
      return;
    }

    // Always get the latest voiceId from the list
    const selectedDoctor = AIDoctorAgents.find(
      (doc) => doc.id === sessionDetail.SelectedDoctor.id
    );
    const voiceId = selectedDoctor?.voiceId || sessionDetail.voiceId;

    if (typeof voiceId !== "string" || voiceId.trim() === "") {
      console.error("Invalid voiceId. Voice ID must be a non-empty string. Current value:", voiceId);
      setError("Invalid Voice ID. Please check doctor configuration.");
      return;
    }
    if (typeof sessionDetail.agentPrompt !== "string" || sessionDetail.agentPrompt.trim() === "") {
      console.error("Invalid sessionDetail.agentPrompt. Agent prompt must be a non-empty string. Current value:", sessionDetail.agentPrompt);
      setError("Invalid Agent Prompt. Please check doctor configuration.");
      return;
    }

    // Explicitly request microphone access
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // If permission granted, start the call
      vapiInstance.start({
        name: sessionDetail.SelectedDoctor.specialist || "Medical AI Doctor",
        firstMessage: "Hi there! I'm your AI medical Assistant. I'm here to help you with any health questions or concerns you might have today. How are you feeling?",
        transcriber: {
          provider: "assembly-ai",
          language: "en",
        },
        voice: {
          provider: "playht",
          voiceId: voiceId,
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: sessionDetail.agentPrompt,
            },
            ...(sessionDetail.notes ? [{ role: "user" as const, content: `User's initial notes: ${sessionDetail.notes}` }] : []),
          ],
        },
      });
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access to start the call.");
      return;
    }
  };

  const EndCall = async () => {
    setLoading(true);
    vapiInstance?.stop();
    const reportResult = await GenerateReport();
    console.log("Medical Report Generated:", reportResult);
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const renderSpeakerStatus = () => {
    if (!callStarted) return <span className="text-gray-500 italic">Call not active</span>;

    switch (currentSpeaker) {
      case "assistant":
        return (
          <span className="text-green-600 font-semibold flex items-center gap-2">
            <Volume2 className="h-4 w-4 animate-pulse" /> Assistant Speaking...
          </span>
        );
      case "user":
        return (
          <span className="text-blue-600 font-semibold flex items-center gap-2">
            <Mic className="h-4 w-4 animate-pulse" /> You are Speaking...
          </span>
        );
      default:
        return (
          <span className="text-gray-500 italic flex items-center gap-2">
            <Mic className="h-4 w-4" /> Listening...
          </span>
        );
    }
  };

  const doctor = sessionDetail?.SelectedDoctor;

  const GenerateReport = async () => {
    if (!messages.length || !sessionDetail || !sessionID) {
      console.error("Cannot generate report: Missing messages, session detail, or session ID.");
      setError("Cannot generate report due to missing data.");
      return null;
    }
    setLoading(true);
    try {
      const result = await axios.post('/api/users/medical-report', {
        messages: messages,
        sessionDetail: sessionDetail,
        sessionID: sessionID,
      });
      console.log("Report API Response:", result.data);
      return result.data;
    } catch (reportError: any) {
      console.error("Error generating report:", reportError);
      setError(`Failed to generate report: ${reportError.response?.data?.error || reportError.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-gray-50 min-h-screen flex flex-col justify-center items-center font-sans">
      <div className="w-full flex justify-between items-center mb-6 p-3 border rounded-lg bg-white shadow-sm">
        <div className="flex gap-3 items-center text-sm font-medium text-gray-700">
          <Circle
            className={`h-4 w-4 ${callStarted ? "text-green-500" : "text-red-500"}`}
            fill={callStarted ? "green" : "red"}
          />
          <span>{callStarted ? "Connected..." : "Not Connected"}</span>
        </div>
        <h2 className="font-bold text-xl text-gray-600">{formatTime(callDuration)}</h2>
      </div>

      {loading && !sessionDetail && !error ? (
        <div className="text-center text-gray-500 mt-20 text-lg">
          <p>Loading doctor info...</p>
          <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 mt-20 text-lg p-4 border border-red-300 rounded-lg bg-red-50 flex flex-col items-center gap-2">
          <XCircle className="h-12 w-12" />
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
        </div>
      ) : doctor && sessionDetail ? (
        <div className="flex flex-col items-center border p-8 rounded-2xl shadow-lg bg-white w-full max-w-sm">
          <img
            src={doctor.image}
            alt={doctor.specialist}
            className="w-[120px] h-[120px] rounded-full object-cover border-4 border-blue-200"
          />
          <h2 className="mt-5 text-2xl font-bold text-gray-800 text-center">
            {doctor.specialist}
          </h2>
          <p className="text-gray-500 text-sm mt-1 text-center">AI Medical Voice Agent</p>

          <div className="mt-8 mb-4 w-full p-4 border rounded-md bg-gray-100 shadow-inner overflow-y-auto h-[150px] text-sm">
            {messages.length === 0 && (
              <p className="text-gray-500 italic text-center py-4">Start the call to see the transcript...</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-2 flex ${msg.speaker === 'assistant' ? 'justify-start' : 'justify-end'}`}> 
                <div className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
                  msg.speaker === 'assistant' ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'
                }`}>
                  <div className={`font-semibold capitalize text-xs mb-1 ${
                    msg.speaker === 'assistant' ? 'text-gray-600' : 'text-blue-100'
                  }`}>
                    {msg.speaker}:
                  </div>
                  <p className="text-base break-words">{msg.text}</p>
                  <div className={`text-xs mt-1 text-right ${
                    msg.speaker === 'assistant' ? 'text-gray-500' : 'text-blue-200'
                  }`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="text-center w-full px-4 py-3 bg-gray-100 rounded-md border text-sm italic">
            {renderSpeakerStatus()}
          </div>

          {!callStarted ? (
            <Button
              onClick={StartCall}
              className="mt-8 w-full py-3 text-lg bg-blue-600 hover:bg-blue-700"
              disabled={loading || !sessionDetail || !sessionDetail.voiceId || !sessionDetail.agentPrompt}
            >
              <PhoneCall className="mr-3 h-5 w-5" /> Start Call
            </Button>
          ) : (
            <Button onClick={EndCall} variant="destructive" className="mt-8 w-full py-3 text-lg" disabled={loading}>
              <PhoneOff className="mr-3 h-5 w-5" /> Disconnect
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-20 text-lg">
          <p>An unexpected issue occurred while loading. Please ensure the session exists.</p>
          <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;