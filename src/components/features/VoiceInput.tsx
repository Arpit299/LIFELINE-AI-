import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, X, Sparkles } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { parseBulkTasks } from '../../lib/gemini/client';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';

export const VoiceInput: React.FC = () => {
  const { addTask, demoMode } = useTaskStore();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check Web Speech API browser support
    const SpeechLib = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechLib) {
      const rec = new SpeechLib();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access is not allowed. Please grant permission in your browser.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech was detected. Please try speaking again.');
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
      setIsSupported(true);
    }
  }, []);

  const handleToggleListen = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      recognition.start();
    }
  };

  const handleProcessVoiceTask = async () => {
    if (!transcript) return;
    setIsProcessing(true);

    try {
      // Use Bulk Task Parser to automatically structure the spoken input
      const parsed = await parseBulkTasks(transcript, demoMode);
      if (parsed && parsed.length > 0) {
        const taskItem = parsed[0];
        await addTask({
          title: taskItem.title,
          description: taskItem.description,
          category: taskItem.category || 'General',
          priority: taskItem.priority || 'medium',
          impact: taskItem.impact || 3,
          deadline: taskItem.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          dependencies: [],
          userId: 'demo-user'
        });
        setTranscript('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between gap-3">
        <span className="text-2xs text-white/30 leading-snug">Voice command requires SpeechRecognition compatible browsers (e.g., Chrome).</span>
        <MicOff className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white/90">Instantly Dictate Task</span>
          <span className="text-3xs text-white/40 mt-0.5">Hands-free task ingest with AI parsing.</span>
        </div>

        <button
          onClick={handleToggleListen}
          className={`p-3 rounded-full transition-all border cursor-pointer ${
            isListening 
              ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>

      {transcript && (
        <div className="flex flex-col gap-2.5 mt-1 bg-black/20 p-3 rounded-lg border border-white/5 animate-fade-in">
          <p className="text-xs text-white/80 leading-relaxed italic">
            "{transcript}"
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setTranscript('')}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleProcessVoiceTask} 
              loading={isProcessing}
              className="py-1 px-3 text-2xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI Extract
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default VoiceInput;
