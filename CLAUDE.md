# AI SCANNER — Project Memory

## CRITICAL: Understanding "Continue" Messages

When the user sends "Continue" — it almost always means the system hit a token limit
error or a generation error and the user clicked "Retry." It does NOT mean they are
asking you to proceed with a new task or asking what's next.

**What to do when you see "Continue":**
1. Resume EXACTLY where you left off before the error
2. Do NOT summarize what was already done
3. Do NOT ask the user what they want to do next
4. If there was a pending action (like killing a process), DO THAT FIRST
5. If the previous work was fully complete, simply confirm it's done in one line

This is a recurring pattern — the user should never have to explain this again.



## User Preferences

- Prefers comprehensive, thorough work — not minimal viable products
- Expects agents to maintain strong context awareness
- Values self-sufficiency — don't ask unnecessary questions
- Reports and documentation should be exhaustive, not summarized
