## Coding Rules

### Color Palette

Only use 4 colors with semantic meaning:

- `primary` - Main actions, links, active states (blue)
- `secondary` - Secondary actions, muted elements (gray)
- `warning` - Warnings, caution states (amber)
- `destructive` - Errors, delete actions, danger states (red)

```jsx
// ✅ Correct
<Button variant="primary">Submit</Button>
<Badge className="bg-warning text-warning-foreground">Pending</Badge>
<span className="text-destructive">Error message</span>

// ❌ Wrong - Don't use arbitrary colors
<Button className="bg-purple-500">Submit</Button>
```

### Constants Naming

Use `SCREAMING_SNAKE_CASE` for all constants:

```javascript
// ✅ Correct
export const GENDER = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other'
};

export const GENDER_OPTIONS = [...];

// ❌ Wrong
export const Gender = { male: 'Male' };
export const genderOptions = [...];
```

### Form Validation with react-hook-form + yup

**EVERY form submit MUST use react-hook-form with yup validation.**

#### Folder Structure

```
feature-name/
├── api/
│   └── feature-api.js          # React Query mutation
├── components/
│   └── feature-form.jsx        # Form component
└── utils/
    └── validation.js           # Yup schema
```

#### Step 1: Create Yup Schema (based on server DTO)

```javascript
// feature-name/utils/validation.js
import * as yup from 'yup';

export const featureSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  gender: yup
    .string()
    .oneOf(['Male', 'Female', 'Other'], 'Invalid gender')
    .optional(),
  dob: yup.string().optional()
});
```

#### Step 2: Implement Form Component

```jsx
// feature-name/components/feature-form.jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { featureSchema } from '../utils/validation';
import { useFeatureMutation } from '../api/feature-api';

export function FeatureForm() {
  const mutation = useFeatureMutation();

  const form = useForm({
    resolver: yupResolver(featureSchema),
    defaultValues: {
      name: '',
      email: '',
      gender: '',
      dob: ''
    }
  });

  const onSubmit = data => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' placeholder='Enter email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
}
```

#### Key Points:

1. **Schema mirrors server DTO** - Match validation rules with backend expectations
2. **Use FormField wrapper** - Never use raw Input without FormField
3. **FormMessage displays errors** - Automatically shows yup validation errors
4. **defaultValues required** - Always provide default values matching schema fields
5. **Disable button while pending** - Use `mutation.isPending` to prevent double submit

### State Management

- **Redux Toolkit** - Client/app state only (auth tokens, session, UI state)
- **React Query** - Server data (user profile, lists, mutations)

```jsx
// ✅ Auth state in Redux
const { isAuthenticated, user } = useSelector(state => state.auth);

// ✅ Server data with React Query
const { data: profile, isLoading } = useProfile();
const updateMutation = useUpdateProfile();
```

### Query Keys (Centralized)

**All React Query keys MUST be defined in `~/lib/query-keys.js`.**

```javascript
// ~/lib/query-keys.js
export const QUERY_KEYS = {
  PROFILE: ['profile'],
  USERS: ['users'],
  USER: id => ['user', id]
};
```

#### Usage:

```javascript
// ✅ Correct - Use centralized query keys
import { QUERY_KEYS } from '~/lib/query-keys';

export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: fetchProfile
  });
};

// For dynamic keys
export const useUser = id => {
  return useQuery({
    queryKey: QUERY_KEYS.USER(id),
    queryFn: () => fetchUser(id)
  });
};

// ❌ Wrong - Don't define query keys in feature files
const PROFILE_QUERY_KEY = ['profile']; // Don't do this
```

#### Key Points:

1. **Single source of truth** - All keys in one file
2. **Easy cache invalidation** - Import and use consistently
3. **Prevents typos** - No hardcoded strings scattered around
4. **Dynamic keys use functions** - `USER: id => ['user', id]`

### Page Files (Composition Only)

**Page files (`page.jsx`) should ONLY compose and arrange components. No business logic.**

#### Rules:

1. **Import and arrange components** - Pages are just layout containers
2. **No hooks** - No `useState`, `useEffect`, `useQuery`, etc.
3. **No business logic** - No data fetching, no form handling
4. **Minimal props** - Pass only what's necessary for layout

#### Location

```
src/app/
├── page.jsx                    # Home page
├── auth/
│   ├── login/
│   │   └── page.jsx            # Login page
│   └── sign-up/
│       └── page.jsx            # Sign up page
└── profile/
    └── page.jsx                # Profile page
```

#### Example

```jsx
// ✅ Correct - Page only arranges components
// src/app/profile/page.jsx
import { Profile } from '~/features/users/view-profile/components/profile';

export default function ProfilePage() {
  return (
    <div className='container py-8'>
      <Profile />
    </div>
  );
}
```

```jsx
// ❌ Wrong - Page has business logic
// src/app/profile/page.jsx
import { useState, useEffect } from 'react';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

export default function ProfilePage() {
  const { data: profile } = useProfile(); // ❌ No hooks in pages
  const [isEditing, setIsEditing] = useState(false); // ❌ No state in pages

  return (
    <div>
      {profile?.name} {/* ❌ Logic belongs in feature component */}
    </div>
  );
}
```

#### Key Points:

1. **All logic lives in feature components** - `features/*/components/*.jsx`
2. **Pages are dumb containers** - Only layout and composition
3. **Easy to test** - Feature components can be tested in isolation
4. **Clear separation** - Routes define structure, features define behavior

---

## UI Components

### Multi-Select

In ui folder there is a multi-select component from @wds/multi-select (Web Dev Simplified Shadcn registry).

Usage:

```jsx
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue
} from '~/components/ui/multi-select';

<MultiSelect>
  <MultiSelectTrigger className='w-full'>
    <MultiSelectValue placeholder='Select items...' />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectGroup>
      <MultiSelectItem value='option1'>Option 1</MultiSelectItem>
      <MultiSelectItem value='option2'>Option 2</MultiSelectItem>
    </MultiSelectGroup>
  </MultiSelectContent>
</MultiSelect>;
```
