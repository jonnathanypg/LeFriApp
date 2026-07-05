# Style Guide: LeFri Platform

## 1. Code Style

### 1.1 TypeScript/JavaScript

#### Naming Conventions
- Use `camelCase` for variables and functions
- Use `PascalCase` for classes and interfaces
- Use `UPPER_SNAKE_CASE` for constants
- Use `kebab-case` for file names
- Prefix interfaces with `I` (e.g., `IUser`)
- Prefix types with `T` (e.g., `TUserData`)

#### File Organization
```typescript
// Imports
import { useState } from 'react';
import type { IUser } from '../types';

// Constants
const MAX_RETRIES = 3;

// Types/Interfaces
interface IProps {
  user: IUser;
}

// Component/Class
export const UserProfile: React.FC<IProps> = ({ user }) => {
  // State
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleSubmit = async () => {
    // Implementation
  };

  // Render
  return (
    // JSX
  );
};
```

### 1.2 React Components

#### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import type { IProps } from './types';

// 2. Constants
const DEFAULT_TIMEOUT = 5000;

// 3. Types
interface IState {
  // State types
}

// 4. Component
export const Component: React.FC<IProps> = ({ prop1, prop2 }) => {
  // 5. State
  const [state, setState] = useState<IState>({});

  // 6. Effects
  useEffect(() => {
    // Effect implementation
  }, [dependencies]);

  // 7. Handlers
  const handleEvent = () => {
    // Handler implementation
  };

  // 8. Render helpers
  const renderContent = () => {
    // Render logic
  };

  // 9. Main render
  return (
    // JSX
  );
};
```

### 1.3 CSS/Styling

#### Tailwind CSS
- Use utility classes for styling
- Group related utilities
- Use custom components for repeated patterns
- Follow mobile-first approach

```jsx
// Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-800">Title</h2>
  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
    Action
  </button>
</div>

// Bad
<div className="flex p-4 bg-white rounded-lg shadow-md items-center justify-between">
  <h2 className="text-xl font-semibold text-gray-800">Title</h2>
  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
    Action
  </button>
</div>
```

## 2. Project Structure

### 2.1 Directory Organization
```
src/
├── components/          # Reusable components
│   ├── common/         # Shared components
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── services/           # API and external services
├── utils/              # Utility functions
├── types/              # TypeScript types
└── pages/              # Page components
```

### 2.2 File Naming
- React components: `PascalCase.tsx`
- Hooks: `useHookName.ts`
- Utilities: `camelCase.ts`
- Types: `types.ts`
- Constants: `constants.ts`

## 3. Git Workflow

### 3.1 Branch Naming
- Feature: `feature/feature-name`
- Bugfix: `fix/bug-description`
- Hotfix: `hotfix/issue-description`
- Release: `release/version`

### 3.2 Commit Messages
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Testing
- `chore`: Maintenance

Example:
```
feat(auth): add Google OAuth integration

- Implement Google OAuth flow
- Add user authentication
- Update user profile

Closes #123
```

## 4. Documentation

### 4.1 Code Documentation
```typescript
/**
 * Function description
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @throws {Error} Error description
 */
function functionName(paramName: Type): Type {
  // Implementation
}
```

### 4.2 Component Documentation
```typescript
/**
 * Component description
 * @component
 * @param {IProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const Component: React.FC<IProps> = ({ prop1, prop2 }) => {
  // Implementation
};
```

## 5. Testing

### 5.1 Test File Structure
```typescript
// Component.test.tsx
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  // Setup
  beforeEach(() => {
    // Setup code
  });

  // Tests
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

### 5.2 Test Naming
- Use descriptive test names
- Follow pattern: `should [expected behavior] when [condition]`
- Group related tests in describe blocks

## 6. Error Handling

### 6.1 Error Types
```typescript
// Custom error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handling
try {
  // Operation
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else {
    // Handle other errors
  }
}
```

### 6.2 Error Messages
- Use clear, descriptive messages
- Include relevant context
- Avoid exposing sensitive information

## 7. Performance

### 7.1 React Optimization
- Use `React.memo` for expensive components
- Implement `useMemo` and `useCallback` appropriately
- Avoid unnecessary re-renders
- Use proper dependency arrays

### 7.2 Code Splitting
- Implement dynamic imports
- Use React.lazy for route-based splitting
- Optimize bundle size

## 8. Security

### 8.1 Data Handling
- Sanitize user input
- Validate data before processing
- Use proper encryption for sensitive data
- Implement proper authentication checks

### 8.2 Environment Variables
- Never commit sensitive data
- Use proper variable naming
- Implement proper access controls
- Use base64 encoding for sensitive values

## 9. Accessibility

### 9.1 HTML Semantics
- Use proper HTML elements
- Implement ARIA attributes
- Ensure proper heading hierarchy
- Use semantic HTML5 elements

### 9.2 Keyboard Navigation
- Implement proper focus management
- Use keyboard shortcuts
- Ensure proper tab order
- Handle keyboard events appropriately