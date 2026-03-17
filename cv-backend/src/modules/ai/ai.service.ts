import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

type Language = 'vi' | 'en' | 'ja' | 'ko' | 'zh';
type JsonRecord = Record<string, unknown>;

@Injectable()
export class AiService {
  private readonly groqApiUrl =
    'https://api.groq.com/openai/v1/chat/completions';
  private readonly groqModel = 'llama-3.3-70b-versatile';

  private getLanguageName(language: Language): string {
    const languageNames: Record<Language, string> = {
      vi: 'Vietnamese',
      en: 'English',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
    };

    return languageNames[language];
  }

  async scoreInsight(input: {
    cvId?: string;
    cvData: unknown;
    jobDescription?: string;
    targetRole?: string;
    language?: Language;
  }) {
    const normalizedJobDescription = input.jobDescription?.trim() ?? '';
    const normalizedTargetRole = input.targetRole?.trim() ?? '';

    if (!normalizedJobDescription && !normalizedTargetRole) {
      throw new BadRequestException(
        'jobDescription or targetRole is required',
      );
    }

    const language = input.language ?? 'vi';
    const systemPrompt =
      language === 'vi'
        ? 'Bạn là một Hệ thống Đánh giá Hồ sơ (ATS) kết hợp với Technical Recruiter. Trả về CHỈ JSON hợp lệ, không markdown.'
        : 'You are an ATS resume evaluator combined with a technical recruiter. Return ONLY valid JSON with no markdown.';

    const userPrompt = {
      task: 'score-insight',
      targetRole: normalizedTargetRole || null,
      cvData: input.cvData,
      jobDescription: normalizedJobDescription || null,
      scoringCriteria: [
        {
          name:
            language === 'vi'
              ? 'Kỹ năng chuyên môn'
              : 'Technical Skills Match',
          weight: 40,
          guidance:
            language === 'vi'
              ? 'Khớp các từ khóa công nghệ, công cụ.'
              : 'Match technologies, tools, and technical keywords.',
        },
        {
          name:
            language === 'vi'
              ? 'Kinh nghiệm & Dự án'
              : 'Experience & Projects Relevance',
          weight: 30,
          guidance:
            language === 'vi'
              ? 'Sự tương quan giữa dự án cũ và vị trí ứng tuyển.'
              : 'Relevance between prior projects/experience and target role.',
        },
        {
          name:
            language === 'vi'
              ? 'Kết quả đo lường được'
              : 'Measurable Results',
          weight: 20,
          guidance:
            language === 'vi'
              ? 'Có số liệu thành tích rõ ràng (%, số liệu, KPI, tác động) hay không.'
              : 'Presence and quality of quantified achievements (%, KPI, impact).',
        },
        {
          name:
            language === 'vi'
              ? 'Trình bày & Từ khóa ATS'
              : 'Presentation & ATS Keywords',
          weight: 10,
          guidance:
            language === 'vi'
              ? 'CV có dễ đọc, súc tích, đúng từ khóa ATS không.'
              : 'Readability, conciseness, and ATS keyword usage.',
        },
      ],
      evaluationProcess: [
        '1) Analyze JD and extract key skills + key responsibilities',
        '2) Compare CV line-by-line against JD/target role requirements',
        '3) Score each rubric category and explain deductions',
        '4) Return final score out of 100',
      ],
      requiredOutput: {
        score: 'number(0-100)',
        jd_analysis: {
          key_skills: ['string'],
          key_responsibilities: ['string'],
        },
        score_breakdown: [
          {
            criterion:
              'technical_skills|experience_projects|measurable_results|ats_presentation',
            weight: 'number',
            score: 'number',
            deduction_reason: 'string',
          },
        ],
        improvements: ['string'],
        missing_keywords: ['string'],
        section_feedback: [
          {
            section:
              'header|experience|education|skills|projects|languages|certifications|custom',
            issue: 'string',
            suggestion: 'string',
          },
        ],
      },
      rules: [
        normalizedJobDescription
          ? 'Score reflects practical fit with JD and target role'
          : 'Score reflects practical fit with target role even without JD',
        'Use weighted scoring exactly: technical_skills=40, experience_projects=30, measurable_results=20, ats_presentation=10',
        'score must equal the sum of all score_breakdown.score values, rounded to integer 0..100',
        'If JD is missing, infer reasonable expectations from target role and common hiring standards',
        'Always explain why points were deducted for each score_breakdown item via deduction_reason',
        'If asked again later, keep the same rubric and weighting for consistency',
        'improvements and missing_keywords should be concise and actionable',
        `All human-readable output text must be in ${this.getLanguageName(language)}`,
      ],
    };

    const parsed = await this.callGroqJson(systemPrompt, userPrompt);
    const sectionFeedback = this.safeArrayOfRecords(parsed.section_feedback)
      .map((item) => ({
        section: typeof item.section === 'string' ? item.section : 'custom',
        issue: typeof item.issue === 'string' ? item.issue : '',
        suggestion: typeof item.suggestion === 'string' ? item.suggestion : '',
      }))
      .filter((item) => item.issue || item.suggestion);

    const scoreBreakdown = this.safeArrayOfRecords(parsed.score_breakdown)
      .map((item) => ({
        criterion:
          typeof item.criterion === 'string'
            ? item.criterion
            : 'technical_skills',
        weight: this.safeNumber(item.weight, 0, 100),
        score: this.safeNumber(item.score, 0, 100),
        note:
          typeof item.deduction_reason === 'string'
            ? item.deduction_reason
            : typeof item.note === 'string'
              ? item.note
              : '',
      }))
      .filter((item) => item.criterion && item.note);

    return {
      score: this.safeNumber(parsed.score, 0, 100),
      score_breakdown: scoreBreakdown,
      improvements: this.safeStringArray(parsed.improvements),
      missing_keywords: this.safeStringArray(parsed.missing_keywords),
      section_feedback: sectionFeedback,
    };
  }

  async optimizeBullet(input: {
    field?: string;
    text?: string;
    targetRole?: string;
    keywords?: string[];
    sectionId?: string;
    sectionData?: unknown;
    jobTitle?: string;
    language?: Language;
  }) {
    if (!input.text?.trim() && !input.sectionData) {
      throw new BadRequestException('text or sectionData is required');
    }

    const language = input.language ?? 'vi';
    const systemPrompt =
      language === 'vi'
        ? 'Bạn là chuyên gia tối ưu CV. Trả về CHỈ JSON hợp lệ, không markdown.'
        : 'You optimize resume bullets. Return ONLY valid JSON with no markdown.';

    const userPrompt = {
      task: 'optimize-bullet',
      role: input.targetRole ?? null,
      jobTitle: input.jobTitle ?? null,
      field: input.field ?? null,
      sectionId: input.sectionId ?? null,
      sectionData: input.sectionData ?? null,
      text: input.text ?? null,
      keywords: input.keywords ?? [],
      requiredOutput: {
        field: 'string|null',
        before: 'string|null',
        after: 'string|null',
        keywords_used: ['string'],
        ats_safe: 'boolean',
        suggested_section: 'object|null',
        summary: 'string',
      },
      rules: [
        'Fix grammar/spelling',
        'Use stronger action verbs',
        'Keep ATS keywords relevant',
        'If sectionData is provided, optimize the entire section while preserving facts',
        'Do not fabricate facts',
        `All human-readable output text must be in ${this.getLanguageName(language)}`,
      ],
    };

    const parsed = await this.callGroqJson(systemPrompt, userPrompt);
    const suggestedSection = this.asRecord(parsed.suggested_section);

    return {
      field:
        typeof parsed.field === 'string' ? parsed.field : (input.field ?? null),
      before: input.text ?? null,
      after:
        typeof parsed.after === 'string' ? parsed.after : (input.text ?? null),
      keywords_used: this.safeStringArray(parsed.keywords_used),
      ats_safe: typeof parsed.ats_safe === 'boolean' ? parsed.ats_safe : true,
      suggested_section: suggestedSection,
      summary:
        typeof parsed.summary === 'string'
          ? parsed.summary
          : 'Đã tạo gợi ý tối ưu cho section.',
    };
  }

  async chatAssistant(input: {
    message: string;
    cvData: unknown;
    language?: Language;
  }) {
    if (!input.message?.trim()) {
      throw new BadRequestException('message is required');
    }

    const language = input.language ?? 'vi';
    const systemPrompt =
      language === 'vi'
        ? 'Bạn là trợ lý chỉnh sửa CV. Trả về CHỈ JSON hợp lệ, không markdown.'
        : 'You are a resume editing assistant. Return ONLY valid JSON with no markdown.';

    const userPrompt = {
      task: 'chat-assistant',
      targetLanguage: this.getLanguageName(language),
      message: input.message,
      cvData: input.cvData,
      requiredOutput: {
        message: 'string',
        operations: [
          {
            op: 'add_item|update_field|remove_item|rewrite_section|translate_section',
            section: 'string',
            path: 'string|null',
            data: 'object|null',
          },
        ],
        updated_cv: 'object|null',
      },
      rules: [
        'Prefer operations over replacing full cv',
        'Do not hallucinate certificates/experience',
        `All human-readable output text must be in ${this.getLanguageName(language)}`,
        'If user asks to rewrite/translate all content, generate operations for every relevant section, not just one section',
        'For translate_section or rewrite_section, include full translated section data in operation.data (at least data.items, and data.title if changed)',
        'Keep proper nouns, company names, technologies, email, URL unchanged unless user explicitly asks to localize them',
      ],
    };

    const parsed = await this.callGroqJson(systemPrompt, userPrompt);
    const operations = this.safeArrayOfRecords(parsed.operations)
      .map((operation) => ({
        op: typeof operation.op === 'string' ? operation.op : 'update_field',
        section:
          typeof operation.section === 'string' ? operation.section : 'custom',
        path: typeof operation.path === 'string' ? operation.path : null,
        data: this.asRecord(operation.data),
      }))
      .filter((operation) => operation.section);

    return {
      message:
        typeof parsed.message === 'string'
          ? parsed.message
          : 'Đã xử lý yêu cầu chỉnh sửa CV.',
      operations,
      updated_cv: this.asRecord(parsed.updated_cv),
    };
  }

  private async callGroqJson(
    systemPrompt: string,
    payload: unknown,
  ): Promise<JsonRecord> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY is not configured');
    }

    const response = await fetch(this.groqApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.groqModel,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: JSON.stringify(payload),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new InternalServerErrorException(
        `Groq API error: ${response.status} ${errText}`,
      );
    }

    const data = (await response.json()) as unknown;
    const dataRecord = this.asRecord(data);
    const choices = this.safeArrayOfRecords(dataRecord?.choices);
    const firstChoice = choices[0];
    const message = this.asRecord(firstChoice?.message);
    const content = message?.content;

    if (!content || typeof content !== 'string') {
      throw new InternalServerErrorException('Invalid response from Groq');
    }

    try {
      return this.parseJsonRecord(content);
    } catch {
      const fallback = this.extractJson(content);
      if (fallback) {
        return fallback;
      }
      throw new InternalServerErrorException('Failed to parse AI JSON output');
    }
  }

  private extractJson(rawText: string): JsonRecord | null {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    const jsonSlice = rawText.slice(start, end + 1);
    try {
      return this.parseJsonRecord(jsonSlice);
    } catch {
      return null;
    }
  }

  private parseJsonRecord(value: string): JsonRecord {
    const parsed = JSON.parse(value) as unknown;
    const parsedRecord = this.asRecord(parsed);
    if (!parsedRecord) {
      throw new InternalServerErrorException(
        'AI response is not a JSON object',
      );
    }
    return parsedRecord;
  }

  private asRecord(value: unknown): JsonRecord | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return null;
    }
    return value as JsonRecord;
  }

  private safeArrayOfRecords(value: unknown): JsonRecord[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((item) => this.asRecord(item))
      .filter((item): item is JsonRecord => item !== null);
  }

  private safeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private safeNumber(value: unknown, min: number, max: number): number {
    const number = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(number)) {
      return min;
    }
    return Math.max(min, Math.min(max, Math.round(number)));
  }
}
