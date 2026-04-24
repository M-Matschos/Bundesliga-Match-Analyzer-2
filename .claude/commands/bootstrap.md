# /bootstrap — Generate New Module/Router/Component

Quick scaffolding for new features using predefined templates.

**Usage:**
```
/bootstrap router auth --endpoints register,login,refresh,profile
/bootstrap router matches --endpoints get_all,get_one,search
/bootstrap component Button --props title,onPress
/bootstrap screen Dashboard
```

**Available Types:**
- `router` — Backend API router with CRUD
- `component` — React Native reusable component
- `screen` — Full screen (React Native)
- `service` — API service client

**What gets created:**
✅ Source file with scaffolding
✅ TypeScript/Python type hints
✅ Unit test template
✅ Swagger documentation
✅ Integration into main files

**Example:**
```
/bootstrap router teams --endpoints get_all,get_one,get_stats
→ backend/app/routers/teams.py (fully implemented)
→ backend/app/models/schemas.py (Team schema)
→ backend/tests/unit/routers/test_teams.py (tests)
```

**Used by:** Daily development, feature branches
