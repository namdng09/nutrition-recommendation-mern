// src/features/users/view-achievements/components/achievement-icons.jsx

export const PlannerIcon = ({ className = 'h-7 w-7' }) => (
  <div className='relative'>
    <svg className={className} viewBox='0 0 24 24' fill='none'>
      <defs>
        <linearGradient id='planner-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#3b82f6' />
          <stop offset='100%' stopColor='#8b5cf6' />
        </linearGradient>
      </defs>
      <circle cx='12' cy='12' r='10' fill='url(#planner-grad)' opacity='0.2' />
      <path
        d='M9 11l3 3 7-7M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z'
        stroke='url(#planner-grad)'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </div>
);

export const DisciplinedIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='disciplined-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#0ea5e9' />
        <stop offset='100%' stopColor='#6366f1' />
      </linearGradient>
    </defs>
    <path
      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      stroke='url(#disciplined-grad)'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <circle cx='12' cy='12' r='3' fill='url(#disciplined-grad)' opacity='0.3' />
  </svg>
);

export const LifestyleArchitectIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='architect-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#f59e0b' />
        <stop offset='50%' stopColor='#f97316' />
        <stop offset='100%' stopColor='#dc2626' />
      </linearGradient>
      <filter id='glow'>
        <feGaussianBlur stdDeviation='2' result='coloredBlur' />
        <feMerge>
          <feMergeNode in='coloredBlur' />
          <feMergeNode in='SourceGraphic' />
        </feMerge>
      </filter>
    </defs>
    <path
      d='M12 15l-8-5 8-5 8 5-8 5z'
      stroke='url(#architect-grad)'
      strokeWidth='2'
      fill='url(#architect-grad)'
      fillOpacity='0.3'
      filter='url(#glow)'
    />
    <path
      d='M12 15v7M4 10v7l8 5 8-5v-7'
      stroke='url(#architect-grad)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const IngredientExplorerIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='explorer-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#10b981' />
        <stop offset='100%' stopColor='#06b6d4' />
      </linearGradient>
    </defs>
    <circle cx='8' cy='8' r='2' fill='url(#explorer-grad)' />
    <circle cx='16' cy='8' r='2' fill='url(#explorer-grad)' />
    <circle cx='12' cy='14' r='2' fill='url(#explorer-grad)' />
    <path
      d='M8 13s1.5 2 4 2 4-2 4-2M12 3v2m0 14v2M3 12h2m14 0h2'
      stroke='url(#explorer-grad)'
      strokeWidth='2'
      strokeLinecap='round'
    />
    <circle
      cx='12'
      cy='12'
      r='9'
      stroke='url(#explorer-grad)'
      strokeWidth='1.5'
      fill='none'
      opacity='0.3'
    />
  </svg>
);

export const VarietySeekerIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='variety-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#14b8a6' />
        <stop offset='100%' stopColor='#8b5cf6' />
      </linearGradient>
    </defs>
    <circle
      cx='11'
      cy='11'
      r='8'
      stroke='url(#variety-grad)'
      strokeWidth='2.5'
      fill='none'
    />
    <path
      d='M21 21l-4.35-4.35'
      stroke='url(#variety-grad)'
      strokeWidth='2.5'
      strokeLinecap='round'
    />
    <circle cx='11' cy='11' r='3' fill='url(#variety-grad)' opacity='0.4' />
  </svg>
);

export const NutritionalPolymathIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='polymath-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#059669' />
        <stop offset='50%' stopColor='#0891b2' />
        <stop offset='100%' stopColor='#7c3aed' />
      </linearGradient>
    </defs>
    <circle
      cx='12'
      cy='12'
      r='10'
      stroke='url(#polymath-grad)'
      strokeWidth='2'
      fill='none'
    />
    <circle
      cx='12'
      cy='12'
      r='6'
      stroke='url(#polymath-grad)'
      strokeWidth='1.5'
      fill='url(#polymath-grad)'
      fillOpacity='0.2'
    />
    <path
      d='M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'
      stroke='url(#polymath-grad)'
      strokeWidth='1.5'
      strokeLinecap='round'
    />
  </svg>
);

export const SparkOfInterestIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='spark-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#f472b6' />
        <stop offset='50%' stopColor='#c026d3' />
        <stop offset='100%' stopColor='#7c3aed' />
      </linearGradient>
    </defs>
    <path
      d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
      fill='url(#spark-grad)'
      stroke='url(#spark-grad)'
      strokeWidth='1.5'
      strokeLinejoin='round'
    />
    <circle cx='12' cy='12' r='4' fill='white' opacity='0.3' />
  </svg>
);

export const HelpfulPeerIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='peer-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#a855f7' />
        <stop offset='100%' stopColor='#ec4899' />
      </linearGradient>
    </defs>
    <path
      d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2'
      stroke='url(#peer-grad)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <circle
      cx='9'
      cy='7'
      r='4'
      stroke='url(#peer-grad)'
      strokeWidth='2'
      fill='url(#peer-grad)'
      fillOpacity='0.2'
    />
    <path
      d='M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'
      stroke='url(#peer-grad)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const CommunityBeaconIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='beacon-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#8b5cf6' />
        <stop offset='50%' stopColor='#d946ef' />
        <stop offset='100%' stopColor='#f97316' />
      </linearGradient>
      <filter id='beacon-glow'>
        <feGaussianBlur stdDeviation='3' result='coloredBlur' />
        <feMerge>
          <feMergeNode in='coloredBlur' />
          <feMergeNode in='SourceGraphic' />
        </feMerge>
      </filter>
    </defs>
    <path
      d='M12 2L2 7l10 5 10-5-10-5z'
      fill='url(#beacon-grad)'
      opacity='0.4'
      filter='url(#beacon-glow)'
    />
    <path
      d='M2 17l10 5 10-5M2 12l10 5 10-5'
      stroke='url(#beacon-grad)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const OnTheMarkIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='mark-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#f97316' />
        <stop offset='100%' stopColor='#dc2626' />
      </linearGradient>
    </defs>
    <circle
      cx='12'
      cy='12'
      r='10'
      stroke='url(#mark-grad)'
      strokeWidth='2'
      fill='none'
    />
    <circle
      cx='12'
      cy='12'
      r='6'
      stroke='url(#mark-grad)'
      strokeWidth='2'
      fill='url(#mark-grad)'
      fillOpacity='0.3'
    />
    <circle cx='12' cy='12' r='2' fill='url(#mark-grad)' />
    <path
      d='M12 2v3M12 19v3M2 12h3M19 12h3'
      stroke='url(#mark-grad)'
      strokeWidth='1.5'
      strokeLinecap='round'
    />
  </svg>
);

export const PhaseMasterIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='phase-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#fb923c' />
        <stop offset='50%' stopColor='#f97316' />
        <stop offset='100%' stopColor='#ea580c' />
      </linearGradient>
    </defs>
    <path
      d='M6 9l6 6 6-6'
      stroke='url(#phase-grad)'
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <rect
      x='3'
      y='3'
      width='18'
      height='18'
      rx='2'
      stroke='url(#phase-grad)'
      strokeWidth='2'
      fill='url(#phase-grad)'
      fillOpacity='0.1'
    />
    <circle cx='12' cy='12' r='3' fill='url(#phase-grad)' opacity='0.5' />
  </svg>
);

export const UnyieldingProgressIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='progress-grad' x1='0%' y1='100%' x2='100%' y2='0%'>
        <stop offset='0%' stopColor='#eab308' />
        <stop offset='50%' stopColor='#f97316' />
        <stop offset='100%' stopColor='#ef4444' />
      </linearGradient>
    </defs>
    <path
      d='M22 12h-4l-3 9L9 3l-3 9H2'
      stroke='url(#progress-grad)'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
    />
    <circle cx='9' cy='8' r='2' fill='url(#progress-grad)' />
  </svg>
);

export const KitchenManagerIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='kitchen-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#ec4899' />
        <stop offset='100%' stopColor='#f472b6' />
      </linearGradient>
    </defs>
    <circle
      cx='9'
      cy='11'
      r='3'
      stroke='url(#kitchen-grad)'
      strokeWidth='2'
      fill='url(#kitchen-grad)'
      fillOpacity='0.3'
    />
    <path
      d='M16 6l4 14H2l4-14M6 20v1a1 1 0 001 1h8a1 1 0 001-1v-1'
      stroke='url(#kitchen-grad)'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const BulkOrganizerIcon = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='none'>
    <defs>
      <linearGradient id='bulk-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#db2777' />
        <stop offset='100%' stopColor='#f472b6' />
      </linearGradient>
    </defs>
    <rect
      x='3'
      y='3'
      width='7'
      height='7'
      rx='1'
      fill='url(#bulk-grad)'
      opacity='0.6'
    />
    <rect
      x='14'
      y='3'
      width='7'
      height='7'
      rx='1'
      fill='url(#bulk-grad)'
      opacity='0.4'
    />
    <rect
      x='14'
      y='14'
      width='7'
      height='7'
      rx='1'
      fill='url(#bulk-grad)'
      opacity='0.8'
    />
    <rect
      x='3'
      y='14'
      width='7'
      height='7'
      rx='1'
      fill='url(#bulk-grad)'
      opacity='1'
    />
  </svg>
);

// Icon mapping object
export const ACHIEVEMENT_ICON_COMPONENTS = {
  THE_PLANNER: PlannerIcon,
  THE_DISCIPLINED: DisciplinedIcon,
  LIFESTYLE_ARCHITECT: LifestyleArchitectIcon,
  INGREDIENT_EXPLORER: IngredientExplorerIcon,
  VARIETY_SEEKER: VarietySeekerIcon,
  NUTRITIONAL_POLYMATH: NutritionalPolymathIcon,
  SPARK_OF_INTEREST: SparkOfInterestIcon,
  HELPFUL_PEER: HelpfulPeerIcon,
  COMMUNITY_BEACON: CommunityBeaconIcon,
  ON_THE_MARK: OnTheMarkIcon,
  PHASE_MASTER: PhaseMasterIcon,
  UNYIELDING_PROGRESS: UnyieldingProgressIcon,
  KITCHEN_MANAGER: KitchenManagerIcon,
  BULK_ORGANIZER: BulkOrganizerIcon
};
