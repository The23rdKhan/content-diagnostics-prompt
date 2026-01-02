export const TIMEZONES = [
  // Americas
  { value: 'America/New_York', label: '(UTC-05:00) Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: '(UTC-06:00) Central Time (US & Canada)' },
  { value: 'America/Denver', label: '(UTC-07:00) Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: '(UTC-08:00) Pacific Time (US & Canada)' },
  { value: 'America/Anchorage', label: '(UTC-09:00) Alaska' },
  { value: 'Pacific/Honolulu', label: '(UTC-10:00) Hawaii' },
  { value: 'America/Toronto', label: '(UTC-05:00) Toronto' },
  { value: 'America/Vancouver', label: '(UTC-08:00) Vancouver' },
  { value: 'America/Mexico_City', label: '(UTC-06:00) Mexico City' },
  { value: 'America/Sao_Paulo', label: '(UTC-03:00) Sao Paulo' },
  { value: 'America/Buenos_Aires', label: '(UTC-03:00) Buenos Aires' },
  { value: 'America/Santiago', label: '(UTC-04:00) Santiago' },
  { value: 'America/Bogota', label: '(UTC-05:00) Bogota' },
  { value: 'America/Lima', label: '(UTC-05:00) Lima' },

  // Europe
  { value: 'Europe/London', label: '(UTC+00:00) London' },
  { value: 'Europe/Paris', label: '(UTC+01:00) Paris' },
  { value: 'Europe/Berlin', label: '(UTC+01:00) Berlin' },
  { value: 'Europe/Madrid', label: '(UTC+01:00) Madrid' },
  { value: 'Europe/Rome', label: '(UTC+01:00) Rome' },
  { value: 'Europe/Amsterdam', label: '(UTC+01:00) Amsterdam' },
  { value: 'Europe/Brussels', label: '(UTC+01:00) Brussels' },
  { value: 'Europe/Vienna', label: '(UTC+01:00) Vienna' },
  { value: 'Europe/Zurich', label: '(UTC+01:00) Zurich' },
  { value: 'Europe/Stockholm', label: '(UTC+01:00) Stockholm' },
  { value: 'Europe/Oslo', label: '(UTC+01:00) Oslo' },
  { value: 'Europe/Copenhagen', label: '(UTC+01:00) Copenhagen' },
  { value: 'Europe/Helsinki', label: '(UTC+02:00) Helsinki' },
  { value: 'Europe/Athens', label: '(UTC+02:00) Athens' },
  { value: 'Europe/Warsaw', label: '(UTC+01:00) Warsaw' },
  { value: 'Europe/Prague', label: '(UTC+01:00) Prague' },
  { value: 'Europe/Budapest', label: '(UTC+01:00) Budapest' },
  { value: 'Europe/Bucharest', label: '(UTC+02:00) Bucharest' },
  { value: 'Europe/Dublin', label: '(UTC+00:00) Dublin' },
  { value: 'Europe/Lisbon', label: '(UTC+00:00) Lisbon' },
  { value: 'Europe/Moscow', label: '(UTC+03:00) Moscow' },
  { value: 'Europe/Istanbul', label: '(UTC+03:00) Istanbul' },

  // Asia & Pacific
  { value: 'Asia/Tokyo', label: '(UTC+09:00) Tokyo' },
  { value: 'Asia/Seoul', label: '(UTC+09:00) Seoul' },
  { value: 'Asia/Shanghai', label: '(UTC+08:00) Shanghai' },
  { value: 'Asia/Hong_Kong', label: '(UTC+08:00) Hong Kong' },
  { value: 'Asia/Singapore', label: '(UTC+08:00) Singapore' },
  { value: 'Asia/Taipei', label: '(UTC+08:00) Taipei' },
  { value: 'Asia/Kuala_Lumpur', label: '(UTC+08:00) Kuala Lumpur' },
  { value: 'Asia/Manila', label: '(UTC+08:00) Manila' },
  { value: 'Asia/Jakarta', label: '(UTC+07:00) Jakarta' },
  { value: 'Asia/Bangkok', label: '(UTC+07:00) Bangkok' },
  { value: 'Asia/Ho_Chi_Minh', label: '(UTC+07:00) Ho Chi Minh' },
  { value: 'Asia/Kolkata', label: '(UTC+05:30) Mumbai / New Delhi' },
  { value: 'Asia/Dubai', label: '(UTC+04:00) Dubai' },
  { value: 'Asia/Riyadh', label: '(UTC+03:00) Riyadh' },
  { value: 'Asia/Jerusalem', label: '(UTC+02:00) Jerusalem' },
  { value: 'Asia/Karachi', label: '(UTC+05:00) Karachi' },
  { value: 'Asia/Dhaka', label: '(UTC+06:00) Dhaka' },

  // Oceania
  { value: 'Australia/Sydney', label: '(UTC+10:00) Sydney' },
  { value: 'Australia/Melbourne', label: '(UTC+10:00) Melbourne' },
  { value: 'Australia/Brisbane', label: '(UTC+10:00) Brisbane' },
  { value: 'Australia/Perth', label: '(UTC+08:00) Perth' },
  { value: 'Pacific/Auckland', label: '(UTC+12:00) Auckland' },

  // Africa
  { value: 'Africa/Johannesburg', label: '(UTC+02:00) Johannesburg' },
  { value: 'Africa/Cairo', label: '(UTC+02:00) Cairo' },
  { value: 'Africa/Lagos', label: '(UTC+01:00) Lagos' },
  { value: 'Africa/Nairobi', label: '(UTC+03:00) Nairobi' },
] as const

export type TimezoneValue = typeof TIMEZONES[number]['value']

/**
 * Get the user's detected timezone or fallback to UTC
 */
export function getDetectedTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}
