const YEAR_REGEX = /^\d{4}$/;
const YEAR_MONTH_REGEX = /^(\d{4})-(0[1-9]|1[0-2])$/;
const FULL_DATE_REGEX = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const SLASH_MONTH_YEAR_REGEX = /^(\d{1,2})[\/-](\d{4})$/;

const padMonth = (month: string): string => month.padStart(2, '0');

export const normalizeMonthYearValue = (value?: string | null): string => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const normalized = raw.replace(/\s+/g, '');

  if (YEAR_MONTH_REGEX.test(normalized) || YEAR_REGEX.test(normalized)) {
    return normalized;
  }

  const fullDateMatch = FULL_DATE_REGEX.exec(normalized);
  if (fullDateMatch) {
    return `${fullDateMatch[1]}-${fullDateMatch[2]}`;
  }

  const slashMatch = SLASH_MONTH_YEAR_REGEX.exec(normalized);
  if (slashMatch) {
    const month = Number.parseInt(slashMatch[1], 10);
    if (month >= 1 && month <= 12) {
      return `${slashMatch[2]}-${padMonth(String(month))}`;
    }
  }

  const compactDigits = normalized.replace(/\D/g, '');
  if (compactDigits.length === 6) {
    const month = compactDigits.slice(0, 2);
    const year = compactDigits.slice(2);
    if (Number.parseInt(month, 10) >= 1 && Number.parseInt(month, 10) <= 12) {
      return `${year}-${month}`;
    }
  }

  return raw;
};

export const toMonthYearDisplay = (value?: string | null): string => {
  const normalized = normalizeMonthYearValue(value);
  const match = YEAR_MONTH_REGEX.exec(normalized);
  if (!match) return normalized;
  return `${match[2]}/${match[1]}`;
};

export const formatCvDate = (value?: string | null): string => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const fullDate = FULL_DATE_REGEX.exec(raw);
  if (fullDate) {
    return `${fullDate[3]}/${fullDate[2]}/${fullDate[1]}`;
  }

  const monthYear = YEAR_MONTH_REGEX.exec(raw);
  if (monthYear) {
    return `${monthYear[2]}/${monthYear[1]}`;
  }

  if (YEAR_REGEX.test(raw)) {
    return raw;
  }

  const normalized = normalizeMonthYearValue(raw);
  if (normalized !== raw) {
    return formatCvDate(normalized);
  }

  return raw;
};

export const formatCvDateRange = (
  startDate?: string | null,
  endDate?: string | null,
  isCurrent?: boolean,
  presentLabel?: string,
): string => {
  const start = formatCvDate(startDate);
  const end = isCurrent ? (presentLabel || 'Present') : formatCvDate(endDate);

  if (start && end) return `${start} - ${end}`;
  return start || end || '';
};
