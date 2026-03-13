import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Video,
  Mic,
  StopCircle,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BrainCircuit,
} from "lucide-react"
import { pitchPracticeAPI } from "@/services/api"

export default function PitchPractice() {
  const [recording, setRecording] = React.useState(false)
  const [videoUrl, setVideoUrl] = React.useState(null)
  const [videoBlob, setVideoBlob] = React.useState(null)
  const [analyzing, setAnalyzing] = React.useState(false)
  const [analysis, setAnalysis] = React.useState(null)
  const [timer, setTimer] = React.useState(0)
  
  const videoRef = React.useRef(null)
  const previewRef = React.useRef(null)
  const mediaRecorderRef = React.useRef(null)
  const timerRef = React.useRef(null)

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      const chunks = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setVideoBlob(blob)
        setVideoUrl(url)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setRecording(true)
      setAnalysis(null)
      setTimer(0)
      
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
      
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      clearInterval(timerRef.current)
    }
  }

  // Handle Analysis
  const analyzePitch = async () => {
    if (!videoBlob) return
    
    setAnalyzing(true)
    const formData = new FormData()
    formData.append('video', videoBlob, 'pitch.webm')
    
    try {
      const data = await pitchPracticeAPI.analyze(videoBlob)
      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        throw new Error(data.error || "Analysis failed")
      }
    } catch (err) {
      console.error("Analysis Error:", err)
      alert("Failed to analyze pitch: " + err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Pitch Practice</h1>
        <p className="text-muted-foreground text-lg">
          Master your delivery. Record your pitch and let our AI provide deep insights on structure, delivery, and content.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recording Section */}
        <Card className="border-2 overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="bg-white dark:bg-slate-950 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Live Studio
              </CardTitle>
              {recording && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-mono font-medium">{formatTime(timer)}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 relative flex flex-col items-center justify-center min-h-[400px]">
            {recording ? (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className="w-full h-full object-cover aspect-video"
              />
            ) : videoUrl ? (
              <video 
                ref={previewRef} 
                src={videoUrl} 
                controls 
                className="w-full h-full object-cover aspect-video"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 p-8 text-center text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Mic className="w-10 h-10" />
                </div>
                <p>No recording found. Press start to begin your session.</p>
              </div>
            )}
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 dark:bg-slate-950/90 p-3 rounded-full shadow-2xl backdrop-blur-sm border">
               {!recording ? (
                 <Button 
                   size="lg" 
                   onClick={startRecording}
                   className="rounded-full gap-2 px-6"
                 >
                   <Play className="w-5 h-5 fill-current" />
                   {videoUrl ? "Record New" : "Start Setup"}
                 </Button>
               ) : (
                 <Button 
                   size="lg" 
                   variant="destructive"
                   onClick={stopRecording}
                   className="rounded-full gap-2 px-6"
                 >
                   <StopCircle className="w-5 h-5 fill-current" />
                   Stop Recording
                 </Button>
               )}
               
               {videoUrl && !recording && (
                 <Button 
                   variant="outline" 
                   className="rounded-full w-12 h-12 p-0"
                   onClick={() => {
                     setVideoUrl(null)
                     setVideoBlob(null)
                   }}
                 >
                   <RotateCcw className="w-5 h-5" />
                 </Button>
               )}
            </div>
          </CardContent>
        </Card>

        {/* AI Analytics Section */}
        <Card className="border-2 flex flex-col">
          <CardHeader className="border-b bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Pitch Analysis
                </CardTitle>
                <CardDescription>Powered by AI Startup Coach</CardDescription>
              </div>
              {analysis && <Badge variant="secondary" className="px-3 py-1">Analysis Ready</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            {!videoUrl ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-muted-foreground py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                  <BrainCircuit className="w-8 h-8 opacity-20" />
                </div>
                <p>Record your pitch to see AI-driven feedback here.</p>
              </div>
            ) : !analysis ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 py-12">
                 <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl max-w-sm text-center">
                   <p className="text-sm text-blue-700 dark:text-blue-300">
                     Video recorded! Ready for the AI to deconstruct your performance.
                   </p>
                 </div>
                 <Button 
                   size="xl" 
                   disabled={analyzing}
                   onClick={analyzePitch}
                   className="rounded-2xl h-24 w-full text-xl gap-4 shadow-lg hover:shadow-primary/20 transition-all border-b-4 border-primary-dark"
                 >
                   {analyzing ? (
                     <Loader2 className="w-8 h-8 animate-spin" />
                   ) : (
                     <Sparkles className="w-8 h-8" />
                   )}
                   {analyzing ? "Syncing the video..." : "Analyze My Pitch"}
                 </Button>
                 <p className="text-xs text-muted-foreground flex items-center gap-1 italic">
                   <AlertCircle className="w-3 h-3" />
                   Privacy: Video is processed and immediately deleted.
                 </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-sm">
                  {analysis}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl"
                  onClick={() => setAnalysis(null)}
                >
                  New Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Mic, title: "Clear Delivery", desc: "Speak at a steady pace and articulate clearly." },
          { icon: CheckCircle2, title: "Structure", desc: "Start with a hook, explain the problem, then your solution." },
          { icon: Video, title: "Eye Contact", desc: "Look at the camera as if it's your lead investor." }
        ].map((tip, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
               <tip.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{tip.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
