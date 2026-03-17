'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { Sparkles, X, Loader2, Bot, Gauge, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { aiApi } from '@/features/aiApi';
import { CVData } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  AIChatOperation,
  AILanguage,
  AIScoreBreakdownItem,
  AIScoreInsightResponse,
} from '@/lib/aiTypes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AIAssistantPanelProps {
  open: boolean;
  cvData: CVData;
  onClose: () => void;
  onApplyOperations: (operations: AIChatOperation[]) => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
};

export function AIAssistantPanel({
  open,
  cvData,
  onClose,
  onApplyOperations,
}: AIAssistantPanelProps) {
  const { ensureAccessToken } = useAuth();
  const [isScoring, setIsScoring] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [activeTab, setActiveTab] = useState<'score' | 'chat'>('score');
  const [scoreResult, setScoreResult] = useState<AIScoreInsightResponse | null>(null);
  
  // Chat history state
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Xin chào! Tôi có thể giúp gì cho bản CV của bạn hôm nay?' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const missingKeywords = useMemo(() => scoreResult?.missing_keywords || [], [scoreResult]);
  const scoreBreakdown = useMemo(() => scoreResult?.score_breakdown || [], [scoreResult]);
  const sections = useMemo(() => cvData.sections || [], [cvData.sections]);
  const currentLanguage = ((cvData.language as AILanguage) || 'vi');
  const inferredJobTitle = useMemo(() => {
    const header = sections.find((section) => section.section_type === 'header');
    const title = header?.items?.[0]?.content?.title;
    return typeof title === 'string' ? title : '';
  }, [sections]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  if (!open) return null;

  const canScore = Boolean(
    jobDescription.trim() || jobTitleInput.trim() || inferredJobTitle.trim(),
  );

  const getCriterionLabel = (criterion: string) => {
    switch (criterion) {
      case 'technical_skills':
        return 'Kỹ năng chuyên môn (40đ)';
      case 'experience_projects':
        return 'Kinh nghiệm & Dự án (30đ)';
      case 'measurable_results':
        return 'Kết quả đo lường được (20đ)';
      case 'ats_presentation':
        return 'Trình bày & ATS (10đ)';
      default:
        return criterion;
    }
  };

  const handleScore = async () => {
    if (!canScore) return;

    try {
      setIsScoring(true);
      const token = await ensureAccessToken();
      const result = await aiApi.scoreInsight(token, {
        cvData,
        jobDescription: jobDescription.trim() || undefined,
        targetRole: jobTitleInput.trim() || inferredJobTitle || undefined,
        language: currentLanguage,
      });
      setScoreResult(result);
      toast.success('Đã hoàn thành phân tích CV!');
    } catch (error: unknown) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Không thể chấm điểm CV lúc này'));
    } finally {
      setIsScoring(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      setIsChatting(true);
      const token = await ensureAccessToken();
      const result = await aiApi.chatAssistant(token, {
        message: userMsg,
        cvData,
        language: currentLanguage,
      });
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: result.message }]);
      
      if (result.operations && result.operations.length > 0) {
         onApplyOperations(result.operations);
         // Optional: Notify user that changes were applied
      }
    } catch {
       setChatHistory(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col border-l animate-in slide-in-from-right duration-300 dark:bg-slate-900 dark:border-slate-800">
        
        {/* Header */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-gradient-to-r from-blue-50 to-white dark:border-slate-800 dark:from-blue-950/30 dark:to-slate-950">
          <div className="flex items-center gap-2 text-blue-700 font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>AI Assistant</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="p-2 bg-gray-50/50 border-b dark:bg-slate-900/50 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-1 bg-gray-200/50 p-1 rounded-lg dark:bg-slate-800/60">
            <button
              onClick={() => setActiveTab('score')}
              className={cn(
                "flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === 'score' 
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50"
              )}
            >
              <Gauge className="h-4 w-4" />
              Đánh giá CV
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === 'chat' 
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50"
              )}
            >
              <Bot className="h-4 w-4" />
              Chat AI
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-slate-900/20">
          
          {/* TAB: SCORE */}
          {activeTab === 'score' && (
            <div className="p-4 space-y-6">
              {!scoreResult ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 dark:bg-blue-950/30 dark:border-blue-900">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Tối ưu hóa cho công việc
                    </h3>
                    <p className="text-sm text-blue-600 mb-4">
                      Có thể chỉ nhập tên công việc để chấm nhanh, hoặc thêm JD để phân tích chính xác hơn.
                    </p>
                    <div className="space-y-3">
                      <div>
                         <label className="text-xs font-medium text-gray-500 mb-1 block dark:text-slate-400">Vị trí ứng tuyển (Khuyến nghị)</label>
                         <Input 
                            placeholder="Ví dụ: Frontend Developer" 
                            value={jobTitleInput}
                            onChange={(e) => setJobTitleInput(e.target.value)}
                            className="bg-white dark:bg-slate-900"
                          />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block dark:text-slate-400">Mô tả công việc (JD - Không bắt buộc)</label>
                        <Textarea 
                          placeholder="Dán JD (nếu có) để tăng độ chính xác..." 
                          className="min-h-[120px] bg-white resize-none dark:bg-slate-900"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        onClick={handleScore}
                        disabled={isScoring || !canScore}
                      >
                        {isScoring ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang phân tích...
                          </>
                        ) : (
                          'Chấm điểm ngay'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                   {/* Score Circle */}
                   <div className="flex flex-col items-center justify-center py-4 bg-white rounded-2xl border shadow-sm dark:bg-slate-900 dark:border-slate-700">
                      <div className="relative h-32 w-32 flex items-center justify-center">
                         <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                            <path
                              className="text-gray-100"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            />
                            <path
                              className={cn(
                                "transition-all duration-1000 ease-out",
                                scoreResult.score >= 80 ? "text-green-500" :
                                scoreResult.score >= 50 ? "text-amber-500" : "text-red-500"
                              )}
                              strokeDasharray={`${scoreResult.score}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            />
                         </svg>
                         <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold">{scoreResult.score}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-semibold dark:text-slate-400">Điểm</span>
                         </div>
                      </div>
                      <p className="mt-2 font-medium text-gray-700 dark:text-slate-300">
                        {scoreResult.score >= 80 ? "Rất tốt! 🎉" : 
                         scoreResult.score >= 50 ? "Khá ổn, cần cải thiện" : "Cần sửa nhiều"}
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => setScoreResult(null)} className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                        Phân tích lại
                      </Button>
                   </div>

                   {scoreBreakdown.length > 0 && (
                     <div className="bg-white rounded-xl border p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 dark:text-slate-200">
                          <Gauge className="h-4 w-4 text-blue-500" />
                          Chi tiết chấm điểm theo tiêu chí
                        </h4>
                        <div className="space-y-3">
                          {scoreBreakdown.map((item: AIScoreBreakdownItem, idx: number) => (
                            <div key={`${item.criterion}-${idx}`} className="rounded-lg border border-gray-200 p-3 dark:border-slate-700">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                                  {getCriterionLabel(item.criterion)}
                                </p>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {item.score}/{item.weight}
                                </Badge>
                              </div>
                              {item.note && (
                                <p className="mt-1 text-xs text-gray-600 dark:text-slate-400">{item.note}</p>
                              )}
                            </div>
                          ))}
                        </div>
                     </div>
                   )}

                   {/* Missing Keywords */}
                   {missingKeywords.length > 0 && (
                     <div className="bg-white rounded-xl border p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 dark:text-slate-200">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          Từ khóa còn thiếu
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {missingKeywords.map((kw, i) => (
                            <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                     </div>
                   )}

                   {/* Improvements */}
                   {scoreResult.improvements.length > 0 && (
                     <div className="bg-white rounded-xl border p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Gợi ý cải thiện
                        </h4>
                        <ul className="space-y-3">
                          {scoreResult.improvements.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-slate-400">
                               <span className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
                               {item}
                            </li>
                          ))}
                        </ul>
                     </div>
                   )}
                </div>
              )}
            </div>
          )}

          {/* TAB: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                 {chatHistory.map((msg, idx) => (
                   <div 
                      key={idx} 
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        msg.role === 'user' 
                          ? "ml-auto bg-blue-600 text-white rounded-br-none" 
                          : "bg-white border text-gray-700 rounded-bl-none shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      )}
                   >
                      {msg.content}
                   </div>
                 ))}
                 {isChatting && (
                   <div className="flex items-center gap-2 text-gray-400 text-sm ml-2 dark:text-slate-500">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce dark:bg-slate-500" style={{ animationDelay: '0ms' }}/>
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce dark:bg-slate-500" style={{ animationDelay: '150ms' }}/>
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce dark:bg-slate-500" style={{ animationDelay: '300ms' }}/>
                      </div>
                   </div>
                 )}
                 <div ref={chatEndRef} />
              </div>
              
              <div className="p-4 bg-white border-t dark:bg-slate-900 dark:border-slate-800">
                 <div className="relative">
                    <Textarea
                      placeholder="Nhập yêu cầu (ví dụ: Viết lại phần kinh nghiệm hay hơn...)"
                      className="pr-12 min-h-[50px] max-h-[150px] resize-none py-3"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button 
                      size="icon" 
                      className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleChat}
                      disabled={isChatting || !chatMessage.trim()}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                 </div>
                 <p className="text-[10px] text-center text-gray-400 mt-2 dark:text-slate-600">
                   AI có thể mắc lỗi. Hãy kiểm tra lại nội dung được tạo.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
