# Frontend Engineering Skill

## Purpose

Write frontend code that feels like it was written by an human developer and syntax should be very basic and beginner friendly.

The primary goal is:

> Prefer simple, readable, maintainable code over abstraction, cleverness, or unnecessary architecture.

Do not generate code merely to make the codebase look sophisticated.

Every file, component, hook, utility, context, and abstraction must have a practical reason to exist.

---

# 1. Core Principles

Follow these principles for every frontend implementation.

### 1.1 Write human-readable code

Code should be understandable by another developer without requiring them to trace multiple abstractions.

Prefer:

```tsx
const handleSubmit = async (data: LoginForm) => {
  await login(data);
  navigate("/dashboard");
};
```

Instead of:

```tsx
const executeAuthenticationWorkflow = createAsyncOperation(
  authenticationStrategy,
  navigationStrategy,
  notificationStrategy
);
```

Do not introduce abstraction simply because it is technically possible.

---

### 1.2 Prefer simple solutions

Always start with the simplest implementation that solves the requirement.

Before creating:

- a custom hook
- utility function
- service layer
- repository
- provider
- wrapper component
- generic component
- state manager
- abstraction

ask:

> Does this abstraction solve an actual repeated problem?

If not, keep the logic local.

---

### 1.3 Avoid over-engineering

Do not:

- create 10 files for a small feature
- create generic abstractions for one-time operations
- create components that only wrap another component
- create hooks that contain only one trivial line
- create utilities used by only one piece of code
- create unnecessary service/repository layers
- create configuration systems for simple values
- create excessive TypeScript generic types
- create deeply nested folder structures

---

# 2. Project Scale Determines Architecture

Do not use the same architecture for every project.

## Small project

Prefer a simple structure:

```text
src/
├── components/
├── pages/
├── hooks/
├── context/
├── services/
├── types/
└── utils/
```

Keep related code close together.

Do not create feature-specific architecture unless the feature actually becomes large.

---

## Medium project

Use feature-based organization when features become sufficiently independent.

Example:

```text
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── pages/
│   │
│   ├── users/
│   └── products/
│
├── components/
├── context/
├── lib/
└── types/
```

---

## Large project

Use stronger boundaries between domains/features.

However, do not introduce enterprise architecture unless the project actually requires it.

The architecture should grow because of project complexity, not because the agent wants to demonstrate architectural patterns.

---

# 3. React Components

Components should have one clear responsibility.

Good:

```tsx
function UserProfile() {
  return (
    <section>
      <ProfileHeader />
      <ProfileDetails />
      <ProfileActions />
    </section>
  );
}
```

Avoid breaking components into extremely small pieces without a reason.

Do not create:

```text
UserProfile/
├── UserProfileContainer.tsx
├── UserProfileWrapper.tsx
├── UserProfileSection.tsx
├── UserProfileContent.tsx
├── UserProfileTitle.tsx
└── UserProfileText.tsx
```

if those components are only used once and contain trivial markup.

A component should usually be extracted when:

- it is reused
- it has meaningful independent behavior
- it has substantial UI complexity
- it has its own state
- it improves readability significantly

---

# 4. Event Handlers

Handlers should be simple and easy to follow.

Create separate handlers for separate operations.

Prefer:

```tsx
const handleCreateUser = async (data: UserForm) => {
  await createUser(data);
};

const handleDeleteUser = async (id: string) => {
  await deleteUser(id);
};

const handleEditUser = (user: User) => {
  setSelectedUser(user);
};
```

Avoid one giant handler:

```tsx
const handleEverything = async (
  type: string,
  data: unknown,
  id?: string
) => {
  if (type === "create") {
    // ...
  }

  if (type === "delete") {
    // ...
  }

  if (type === "edit") {
    // ...
  }
};
```

Each meaningful operation should have its own handler.

---

# 5. Handler Naming

Use clear names.

Prefer:

```tsx
handleSubmit
handleCreateUser
handleUpdateUser
handleDeleteUser
handleSearch
handleLogin
handleLogout
handleOpenModal
handleCloseModal
handlePageChange
```

Avoid:

```tsx
doIt
process
execute
handleAction
handleOperation
run
manageData
```

unless the name genuinely represents that operation.

---

# 6. Forms

Use **React Hook Form** for forms.

Prefer:

```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginForm>();
```

Validation should be explicit.

For schema validation, use an appropriate resolver such as:

```tsx
zodResolver(schema)
```

or another resolver when appropriate.

Do not manually maintain state for every form field when React Hook Form can handle it.

Avoid:

```tsx
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
```

for ordinary forms.

Use controlled state only when there is an actual reason to do so.

---

# 7. API Calls

Keep API communication clear and predictable.

For simple features, an API function can be:

```tsx
export const createUser = async (data: CreateUserInput) => {
  const response = await api.post("/users", data);
  return response.data;
};
```

Then the component handles the UI operation:

```tsx
const handleCreateUser = async (data: CreateUserInput) => {
  try {
    await createUser(data);
  } catch (error) {
    console.error(error);
  }
};
```

Do not introduce a large API abstraction for a small application.

Avoid unnecessary layers such as:

```text
Component
    ↓
Hook
    ↓
Service
    ↓
Repository
    ↓
API Manager
    ↓
HTTP Client
```

when the application does not need them.

---

# 8. API Fetching

Use the project's existing API/data-fetching approach.

If the project already uses:

- Axios
- Fetch
- TanStack Query
- SWR

follow that existing pattern.

Do not introduce another API/data-fetching library unless there is a clear requirement.

For server-state-heavy applications, prefer an appropriate server-state library rather than manually rebuilding caching, loading, invalidation, and synchronization.

---

# 9. Context API

Use **React Context API** for shared application state when appropriate.

Good candidates:

- authenticated user
- authentication state
- theme
- application preferences
- global UI state
- permissions
- other genuinely shared state

Example:

```tsx
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Create a custom hook when it makes the Context easier to consume:

```tsx
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
```

Do not create a Context for every piece of state.

Avoid:

```text
ModalContext
SearchContext
ButtonContext
FormContext
UserNameContext
TableContext
InputContext
```

unless there is a genuine shared-state requirement.

Local component state should remain local.

---

# 10. State Management

Use the smallest state solution that solves the problem.

Prefer:

```tsx
const [isOpen, setIsOpen] = useState(false);
```

for local UI state.

Use Context API when multiple distant components genuinely need the state.

Do not introduce Redux/Zustand/etc. simply because the application has state.

If the project already uses a state-management library, follow the existing architecture rather than introducing another system.

---

# 11. Custom Hooks

Create a custom hook when logic is:

- reused
- sufficiently complex
- stateful
- difficult to understand inside the component
- logically independent

Good:

```tsx
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const data = await getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    fetchUsers,
  };
}
```

Do not create:

```tsx
function useToggle() {
  return useState(false);
}
```

unless it is actually reused enough to justify the abstraction.

---

# 12. Avoid Singleton Architecture

Do not put the entire application's logic into one massive singleton/service/object.

Bad:

```tsx
appManager.auth.login()
appManager.users.create()
appManager.products.delete()
appManager.orders.update()
appManager.notifications.send()
```

This creates a central dependency that becomes difficult to maintain.

Prefer organizing logic around actual features and responsibilities.

However, do not split everything into dozens of classes.

Use normal functions and modules when they are sufficient.

---

# 13. Avoid Excessive Abstraction

Before creating an abstraction, ask:

1. Is this logic repeated?
2. Is the abstraction easier to understand than the original code?
3. Does it reduce meaningful duplication?
4. Will it likely be reused?
5. Does it make testing or maintenance easier?

If most answers are "no", keep the code simple.

---

# 14. File Creation Rules

Do not create a new file unless there is a reason.

Before creating a file, ask:

> Can this logic naturally live in an existing file without making that file difficult to understand?

If yes, keep it there.

But do not put unrelated responsibilities into one huge file.

The goal is balance.

Avoid both:

```text
1 file containing 2000 lines
```

and:

```text
50 files containing 20 lines each
```

Prefer a structure appropriate to the feature's actual complexity.

---

# 15. Keep Related Code Together

Code that changes together should generally live together.

For example:

```text
features/
└── products/
    ├── ProductList.tsx
    ├── ProductForm.tsx
    ├── productApi.ts
    ├── productTypes.ts
    └── useProducts.ts
```

Do not scatter one feature across unrelated global directories unless the project architecture requires it.

---

# 16. Loading and Error States

Every asynchronous UI operation should consider:

- loading
- success
- error
- empty state

Example:

```tsx
if (loading) {
  return <Loader />;
}

if (error) {
  return <ErrorMessage />;
}

if (!users.length) {
  return <EmptyState />;
}

return <UserList users={users} />;
```

Do not create a separate abstraction for every loading/error state.

Reuse existing project components when available.

---

# 17. TypeScript

Use TypeScript to improve clarity.

Prefer meaningful types:

```tsx
interface CreateUserInput {
  name: string;
  email: string;
}
```

Avoid unnecessary complex generics.

Do not use:

```tsx
any
```

unless there is a legitimate reason.

Do not create types/interfaces for trivial values when TypeScript inference is already clear.

---

# 18. Reuse Existing Code

Before writing new code:

1. inspect the existing project
2. identify existing components
3. identify existing hooks
4. identify existing API utilities
5. identify existing contexts
6. identify existing types
7. follow existing naming conventions

Do not create another implementation when an existing one already solves the problem.

---

# 19. Do Not Rewrite Unrelated Code

When implementing a feature:

> Change only what is necessary.

Do not refactor unrelated files merely because the agent thinks they could be cleaner.

Avoid large unnecessary diffs.

If a small feature requires modifying 20 unrelated files, reconsider the implementation.

---

# 20. Comments

Do not add comments that simply explain obvious code.

Bad:

```tsx
// Set loading to true
setLoading(true);
```

Good comments explain:

- why something unusual exists
- business rules
- browser limitations
- non-obvious workarounds
- important architectural decisions

---

# 21. Naming

Use descriptive names.

Prefer:

```tsx
selectedUser
isSubmitting
isDeleteModalOpen
handleCreateUser
fetchUsers
userList
```

Avoid:

```tsx
data1
temp
obj
x
thing
flag
res2
```

Names should communicate intent.

---

# 22. Component Complexity

If a component becomes difficult to understand, identify the actual reason.

Possible solutions:

- extract a meaningful component
- extract a meaningful hook
- move API logic into an API module
- simplify the handler
- split unrelated responsibilities

Do not automatically split the component into many tiny components.

---

# 23. Existing Project Conventions Have Priority

When working inside an existing codebase:

> Follow the project's existing conventions before applying this skill.

Inspect:

- folder structure
- naming
- styling approach
- API layer
- state management
- routing
- form handling
- component patterns

Do not introduce a new architecture simply because this skill recommends it.

This skill should guide decisions, not force unnecessary rewrites.

---

# 24. Implementation Process

Before writing code:

### Step 1 — Understand the requirement

Identify:

- what needs to happen
- which UI is required
- which API is required
- what state is required
- what validation is required

### Step 2 — Inspect the existing code

Look for existing:

- components
- API functions
- hooks
- Context
- types
- utilities

### Step 3 — Choose the simplest architecture

Use the smallest number of files and abstractions that keeps the feature maintainable.

### Step 4 — Implement the feature

Keep handlers explicit.

Keep API calls clear.

Use React Hook Form for forms.

Use Context API for genuinely shared state.

### Step 5 — Review the implementation

Before finishing, check:

- Did I create unnecessary files?
- Did I create unnecessary abstractions?
- Did I duplicate existing functionality?
- Is any handler doing too much?
- Can another developer understand this quickly?
- Did I modify unrelated code?
- Is the architecture appropriate for the project's size?

If unnecessary complexity was introduced, simplify it.

---

# 25. Golden Rule

The agent should always prefer:

```text
Simple
Readable
Predictable
Maintainable
Feature-focused
Human-written
```

over:

```text
Abstract
Generic
Over-engineered
Highly fragmented
Clever
Framework-heavy
```

The best frontend implementation is not the one with the most architecture.

It is the one that solves the problem clearly with the least unnecessary complexity.