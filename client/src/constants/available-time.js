export const AVAILABLE_TIME = Object.freeze({
  NO_TIME: 'Không có thời gian (<5 phút)',
  LITTLE_TIME: 'Ít thời gian (<15 phút)',
  SOME_TIME: 'Có thời gian (<30 phút)',
  MORE_TIME: 'Nhiều thời gian (<60 phút)',
  LOTS_OF_TIME: 'Rất nhiều thời gian (<90 phút)',
  NO_LIMIT: 'Không giới hạn'
});

export const AVAILABLE_TIME_OPTIONS = [
  { value: AVAILABLE_TIME.NO_TIME, label: 'Không có thời gian (<5 phút)' },
  { value: AVAILABLE_TIME.LITTLE_TIME, label: 'Ít thời gian (<15 phút)' },
  { value: AVAILABLE_TIME.SOME_TIME, label: 'Có thời gian (<30 phút)' },
  { value: AVAILABLE_TIME.MORE_TIME, label: 'Nhiều thời gian (<60 phút)' },
  {
    value: AVAILABLE_TIME.LOTS_OF_TIME,
    label: 'Rất nhiều thời gian (<90 phút)'
  },
  { value: AVAILABLE_TIME.NO_LIMIT, label: 'Không giới hạn' }
];
