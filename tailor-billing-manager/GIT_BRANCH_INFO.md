# Git Branch Information

## Which Branch Will Be Pulled?

When you click **"Sync (Git Pull)"**, the application will pull from:

### Default Behavior

**The current branch's upstream/remote branch**

For example:
- If you're on `development` branch → pulls from `origin/development`
- If you're on `main` branch → pulls from `origin/main`
- If you're on `master` branch → pulls from `origin/master`

### How It Works

1. **Check Current Branch**: The app detects which Git branch you're currently on
2. **Find Remote Branch**: It finds the remote tracking branch (usually `origin/branch-name`)
3. **Pull**: Executes `git pull` which pulls from the current branch's upstream

### Viewing Branch Information

In the GUI application, you can see:

1. **Git Branch Display** (in Service Status section):
   - Shows: `current-branch → remote/branch-name`
   - Example: `development → origin/development`
   - Updates automatically when you refresh status

2. **Sync Confirmation Dialog**:
   - Shows which branch will be pulled before confirming
   - Example: "Current Branch: development" and "Pulling from: origin/development"

### Branch Detection

The application automatically detects:
- ✅ Current local branch name
- ✅ Remote tracking branch (if configured)
- ✅ Remote repository name (usually `origin`)

### If No Remote Branch Configured

If your branch doesn't have an upstream configured, it will:
- Still show the current branch name
- Attempt to pull from `origin/current-branch-name`
- Show an error if the remote branch doesn't exist

### Common Scenarios

#### Scenario 1: Standard Setup
```
Current Branch: development
Remote: origin/development
→ Pulls from: origin/development ✅
```

#### Scenario 2: No Upstream Configured
```
Current Branch: feature/new-feature
Remote: N/A
→ Pulls from: origin/feature/new-feature (if exists)
```

#### Scenario 3: Different Remote Name
```
Current Branch: main
Remote: upstream/main
→ Pulls from: upstream/main ✅
```

### Setting Up Branch Tracking

If your branch doesn't have upstream tracking, you can set it:

```powershell
# Set upstream for current branch
git branch --set-upstream-to=origin/development development

# Or when pushing for the first time
git push -u origin development
```

### Verifying Your Branch

Before syncing, you can verify:

1. **In the GUI**: Check the "Git Branch" field in Service Status
2. **In Command Line**:
   ```powershell
   git branch --show-current          # Current branch
   git branch -vv                     # All branches with tracking info
   ```

---

**Note**: The application always pulls from the **current branch's upstream**. If you want to pull from a different branch, you'll need to switch branches first using Git commands.
